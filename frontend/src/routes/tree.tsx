import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import TreeView from '../components/TreeView'

const searchSchema = z.object({
  dataIndex: z.number().int().min(0).optional().default(0),
  decimalPlaces: z.number().int().min(-1).max(10).optional().default(4),
  pathFilter: z.enum(['all', 'finished', 'top2']).optional().default('top2'),
})

export type SearchParams = z.infer<typeof searchSchema>

export const Route = createFileRoute('/tree')({
  validateSearch: searchSchema,
  component: TreeView,
})
