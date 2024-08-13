import React, { useEffect } from 'react'

import {
  ListNavItems,
  NavigationContainer,
  NavItem
} from '@keystone-6/core/admin-ui/components'
import { Button } from '@keystone-ui/button'

import type { NavigationProps } from '@keystone-6/core/admin-ui/components'
import { useMutation, gql } from '@keystone-6/core/admin-ui/apollo'

export default function Navigation ({ lists }: NavigationProps) {
  return (
    <NavigationContainer>
      <NavItem href='/'>Dashboard</NavItem>
      <ListNavItems lists={lists} />
      <SignoutButton />
    </NavigationContainer>
  )
}


const END_SESSION = gql`
  mutation EndSession {
    endSession
  }
`

function SignoutButton () {
  const [endSession, { loading, data }] = useMutation(END_SESSION)
  useEffect(() => {
    if (data?.endSession) {
      window.location.reload()
    }
  }, [data])

  return <Button size="small" isLoading={loading} onClick={() => endSession()}>
    Sign out
  </Button>
}
