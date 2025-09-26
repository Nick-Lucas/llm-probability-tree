import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import { z } from 'zod'
import App from './App'
import TreeView from './TreeView'

const searchSchema = z.object({
  dataIndex: z.number().int().min(0).optional().default(0),
  decimalPlaces: z.number().int().min(-1).max(10).optional().default(4),
  pathFilter: z.enum(['all', 'finished', 'top2']).optional().default('all'),
})

export type SearchParams = z.infer<typeof searchSchema>

const rootRoute = createRootRoute({
  component: () => (
    <div>
      <App />
    </div>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: searchSchema,
  component: TreeView,
})

const routeTree = rootRoute.addChildren([indexRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}