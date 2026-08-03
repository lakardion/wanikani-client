const API_KEY_STORAGE = 'wanikani.apiKey'
const METHOD_STORAGE = 'wanikani.selectedMethod'

export function loadApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE) ?? ''
  } catch {
    return ''
  }
}

export function saveApiKey(value: string): void {
  try {
    localStorage.setItem(API_KEY_STORAGE, value)
  } catch {
    /* ignore */
  }
}

export function loadSelectedMethod(): string | null {
  try {
    return localStorage.getItem(METHOD_STORAGE)
  } catch {
    return null
  }
}

export function saveSelectedMethod(value: string): void {
  try {
    localStorage.setItem(METHOD_STORAGE, value)
  } catch {
    /* ignore */
  }
}
