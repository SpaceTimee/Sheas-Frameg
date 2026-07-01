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

export function splitFileName(fileName: string): { stem: string; extension: string } {
  const lastDotIndex = fileName.lastIndexOf('.')
  if (lastDotIndex <= 0) return { stem: fileName, extension: '' }
  return { stem: fileName.slice(0, lastDotIndex), extension: fileName.slice(lastDotIndex) }
}

export function resolveDisplayName(customName: string | undefined, file: File): string {
  const trimmed = customName?.trim()
  return trimmed ? trimmed : file.name
}

export function buildDownloadFileName(displayName: string, fileName: string, suffix: string): string {
  const { stem } = splitFileName(displayName)
  const { extension } = splitFileName(fileName)
  return `${stem}${suffix}${extension}`
}
