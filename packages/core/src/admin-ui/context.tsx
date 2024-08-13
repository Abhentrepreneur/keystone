import React, { type ReactNode, createContext, useContext, useMemo } from 'react'
import { Center } from '@keystone-ui/core'
import { ToastProvider } from '@keystone-ui/toast'
import { LoadingDots } from '@keystone-ui/loading'
import { DrawerProvider } from '@keystone-ui/modals'
import { createUploadLink } from 'apollo-upload-client'
import {
  type AdminConfig,
  type AdminMeta,
  type FieldViews
} from '../types'
import { ApolloProvider, ApolloClient, InMemoryCache } from './apollo'
import { useQuery } from './apollo'
import {
  type AdminMetaQuery,
  adminMetaQuery
} from './admin-meta-graphql'

type KeystoneContextType = {
  adminConfig: AdminConfig | null
  adminMeta: AdminMeta | null
  apiPath: string | null
  fieldViews: FieldViews
}

const KeystoneContext = createContext<KeystoneContextType>({
  adminConfig: null,
  adminMeta: null,
  apiPath: null,
  fieldViews: {},
})

type KeystoneProviderProps = {
  adminConfig: AdminConfig
  apiPath: string
  fieldViews: FieldViews
  children: ReactNode
}

const expectedExports = new Set(['Cell', 'Field', 'controller', 'CardValue'])

function InternalKeystoneProvider ({
  adminConfig,
  fieldViews,
  children,
  apiPath,
}: KeystoneProviderProps) {
  const { data, loading, error } = useQuery<AdminMetaQuery>(adminMetaQuery)
  const lists = data?.keystone?.adminMeta?.lists

  const meta = useMemo(() => {
    if (!lists) return
    if (error) return

    const result: AdminMeta = {
      lists: {},
    }

    for (const list of lists) {
      result.lists[list.key] = {
        ...list,
        gqlNames: list.graphql.names,
        groups: [],
        fields: {},
      }

      for (const field of list.fields) {
        for (const exportName of expectedExports) {
          if ((fieldViews[field.viewsIndex] as any)[exportName] === undefined) {
            throw new Error(`The view for the field at ${list.key}.${field.path} is missing the ${exportName} export`)
          }
        }

        Object.keys(fieldViews[field.viewsIndex]).forEach(exportName => {
          if (!expectedExports.has(exportName) && exportName !== 'allowedExportsOnCustomViews') {
            throw new Error(`Unexpected export named ${exportName} from the view from the field at ${list.key}.${field.path}`)
          }
        })

        const views = { ...fieldViews[field.viewsIndex] }
        const customViews: Record<string, any> = {}
        if (field.customViewsIndex !== null) {
          const customViewsSource: FieldViews[number] & Record<string, any> = fieldViews[field.customViewsIndex]
          const allowedExportsOnCustomViews = new Set(views.allowedExportsOnCustomViews)
          Object.keys(customViewsSource).forEach(exportName => {
            if (allowedExportsOnCustomViews.has(exportName)) {
              customViews[exportName] = customViewsSource[exportName]
            } else if (expectedExports.has(exportName)) {
              (views as any)[exportName] = customViewsSource[exportName]
            } else {
              throw new Error(`Unexpected export named ${exportName} from the custom view from field at ${list.key}.${field.path}`)
            }
          })
        }

        result.lists[list.key].fields[field.path] = {
          ...field,
          createView: {
            fieldMode: field.createView?.fieldMode ?? null,
          },
          itemView: {
            fieldMode: field.itemView?.fieldMode ?? null,
            fieldPosition: field.itemView?.fieldPosition ?? null,
          },
          listView: {
            fieldMode: field.listView?.fieldMode ?? null,
          },
          graphql: {
            isNonNull: field.isNonNull,
          },
          views,
          controller: views.controller({
            listKey: list.key,
            fieldMeta: field.fieldMeta,
            label: field.label,
            description: field.description,
            path: field.path,
            customViews,
          }),
        }
      }

      for (const group of list.groups) {
        result.lists[list.key].groups.push({
          label: group.label,
          description: group.description,
          fields: group.fields.map(field => result.lists[list.key].fields[field.path]),
        })
      }
    }

    return result
  }, [lists, error, fieldViews])

  if (loading) {
    return (<Center fillView>
      <LoadingDots label='Loading Admin Metadata' size='large' />
    </Center>)
  }

  return (<ToastProvider>
    <DrawerProvider>
      <KeystoneContext.Provider value={{
        adminConfig,
        adminMeta: meta ?? null,
        fieldViews,
        apiPath,
      }}>
        {children}
      </KeystoneContext.Provider>
    </DrawerProvider>
  </ToastProvider>)
}

export function KeystoneProvider (props: KeystoneProviderProps) {
  const apolloClient = useMemo(() => new ApolloClient({
    cache: new InMemoryCache(),
    uri: props.apiPath,
    link: createUploadLink({
      uri: props.apiPath,
      headers: { 'Apollo-Require-Preflight': 'true' },
    }),
  }), [props.apiPath])

  return (
    <ApolloProvider client={apolloClient}>
      <InternalKeystoneProvider {...props} />
    </ApolloProvider>
  )
}

export function useKeystone () {
  return useContext(KeystoneContext)
}

export function useList (listKey: string) {
  const { adminMeta } = useKeystone()
  const { lists } = adminMeta ?? {}
  const list = lists?.[listKey]
  if (!list) throw new Error(`Unknown list ${listKey}`)
  return list
}

export function useField (listKey: string, fieldKey: string) {
  const list = useList(listKey)
  const field = list.fields[fieldKey]
  if (!field) throw new Error(`Unknown field ${listKey}.${fieldKey}`)
  return field
}
