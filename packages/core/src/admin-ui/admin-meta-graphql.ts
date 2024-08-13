import type {
  GraphQLNames,
  JSONValue,
} from '../types/utils'
import { gql } from './apollo'

export const adminMetaQuery = gql`
  query AdminMeta {
    keystone {
      __typename
      adminMeta {
        __typename
        lists {
          __typename
          key
          itemQueryName
          listQueryName
          path
          label
          singular
          plural
          description
          initialColumns
          initialSearchFields
          initialSort {
            __typename
            field
            direction
          }
          pageSize
          labelField
          isSingleton
          groups {
            __typename
            label
            description
            fields {
              path
            }
          }
          graphql {
            names {
              outputTypeName
              whereInputName
              whereUniqueInputName

              createInputName
              createMutationName
              createManyMutationName
              relateToOneForCreateInputName
              relateToManyForCreateInputName

              itemQueryName
              listQueryName
              listQueryCountName
              listOrderName

              updateInputName
              updateMutationName
              updateManyInputName
              updateManyMutationName
              relateToOneForUpdateInputName
              relateToManyForUpdateInputName

              deleteMutationName
              deleteManyMutationName
            }
          }
          fields {
            __typename
            path
            label
            description
            fieldMeta
            viewsIndex
            customViewsIndex
            search
            isNonNull
            createView {
              fieldMode
            }
            itemView {
              fieldMode
              fieldPosition
            }
            listView {
              fieldMode
            }

            isOrderable
            isFilterable
          }

          hideNavigation
          hideCreate
          hideDelete
        }
      }
    }
  }
`

// TODO: duplicate, reference core/src/lib/create-admin-meta.ts
export type AdminMetaQuery = {
  keystone: {
    __typename: 'KeystoneMeta'
    adminMeta: {
      __typename: 'KeystoneAdminMeta'
      lists: {
        __typename: 'KeystoneAdminUIListMeta'
        key: string
        path: string
        description: string | null

        label: string
        labelField: string
        singular: string
        plural: string

        fields: {
          __typename: 'KeystoneAdminUIFieldMeta'
          path: string
          label: string
          description: string | null
          fieldMeta: JSONValue | null
          viewsIndex: number
          customViewsIndex: number | null
          search: 'default' | 'insensitive' | null
          isNonNull: ('read' | 'create' | 'update')[]
          createView: {
            __typename: 'KeystoneAdminUIFieldMetaCreateView'
            fieldMode: 'edit' | 'hidden' | null
          } | null
          itemView: {
            __typename: 'KeystoneAdminUIFieldMetaItemView'
            fieldMode: 'edit' | 'read' | 'hidden' | null
            fieldPosition: 'form' | 'sidebar' | null
          } | null
          listView: {
            __typename: 'KeystoneAdminUIFieldMetaListView'
            fieldMode: 'read' | 'hidden' | null
          } | null

          isFilterable: boolean
          isOrderable: boolean
        }[]
        groups: {
          __typename: 'KeystoneAdminUIFieldGroupMeta'
          label: string
          description: string | null
          fields: {
            __typename: 'KeystoneAdminUIFieldMeta'
            path: string
          }[]
        }[]
        graphql: {
          names: GraphQLNames
        }

        pageSize: number
        initialColumns: string[]
        initialSearchFields: string[]
        initialSort: {
          __typename: 'KeystoneAdminUISort'
          field: string
          direction: 'ASC' | 'DESC'
        } | null
        isSingleton: boolean

        hideNavigation: boolean
        hideCreate: boolean
        hideDelete: boolean

        // TODO: probably remove this
        itemQueryName: string
        listQueryName: string
      }[]
    }
  }
}
