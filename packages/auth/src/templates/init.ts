import type { BaseListTypeInfo } from '@keystone-6/core/types'
import type { AuthConfig } from '../types'

export default function ({
  listKey,
  initFirstItem
}: {
  listKey: string
  initFirstItem: NonNullable<AuthConfig<BaseListTypeInfo>['initFirstItem']>
}) {
  // -- TEMPLATE START
  return `import { getInitPage } from '@keystone-6/auth/pages/InitPage'

export default getInitPage (${JSON.stringify({
  listKey,
  fieldPaths: initFirstItem.fields,
  enableWelcome: !initFirstItem.skipKeystoneWelcome,
})})
`
  // -- TEMPLATE END
}
