import { ColorModeProvider } from '@kobalte/core'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { onMount, Suspense } from 'solid-js'
import { ensurePersisted } from '~/lib/history'
import './index.css'

export default function App() {
  onMount(() => void ensurePersisted())
  return (
    <Router
      root={(props) => (
        <ColorModeProvider disableTransitionOnChange={false}>
          <Suspense>{props.children}</Suspense>
        </ColorModeProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
