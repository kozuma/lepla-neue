import { Suspense } from 'react'

import { ConfirmationView } from './ConfirmationView'

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationView />
    </Suspense>
  )
}
