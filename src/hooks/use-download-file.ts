'use client'

import { useCallback } from 'react'

export function useDownloadFile() {
  const downloadFile = useCallback((url: string, fileName: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.rel = 'noopener'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [])

  return downloadFile
}
