import { createMemo } from 'solid-js'
import { WanikaniClient } from 'wanikani-sdk'
import { apiKey } from '../state'

export const client = createMemo(() => {
  const key = apiKey().trim()
  if (!key) return null
  return new WanikaniClient({ apiKey: key })
})
