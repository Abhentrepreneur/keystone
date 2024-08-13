export default function () {
  // -- TEMPLATE START
  return `import { type AdminConfig } from '@keystone-6/core/types'
import Navigation from '@keystone-6/auth/components/Navigation'

export const components: AdminConfig['components'] = {
  Navigation
}
`
  // -- TEMPLATE END
}
