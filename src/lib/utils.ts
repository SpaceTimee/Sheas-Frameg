import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function mergeClassNames(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function insertFilenameSuffix(filename: string, suffix: string) {
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1) return `${filename}${suffix}`
  return `${filename.slice(0, lastDotIndex)}${suffix}${filename.slice(lastDotIndex)}`
}
