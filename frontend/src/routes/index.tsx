import { createFileRoute, Link, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  
  return (
    <Navigate to="/tree" />
  )
}
