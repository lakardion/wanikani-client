import { ColorModeProvider } from '@kobalte/core'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense } from 'solid-js'
import './index.css'

export default function App() {
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
