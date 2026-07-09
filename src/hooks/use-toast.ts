'use client'

import { useSyncExternalStore, type ReactNode } from 'react'
import type { ToastActionElement, ToastProps } from '@/components/ui/toast'

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 5000

type ToastEntry = ToastProps & {
  id: string
  title?: ReactNode
  description?: ReactNode
  action?: ToastActionElement
}

const toastActionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST'
} as const

type ToastActionType = typeof toastActionTypes

type ToastReducerAction =
  | {
      type: ToastActionType['ADD_TOAST']
      toast: ToastEntry
    }
  | {
      type: ToastActionType['UPDATE_TOAST']
      toast: Partial<ToastEntry>
    }
  | {
      type: ToastActionType['DISMISS_TOAST']
      toastId?: ToastEntry['id']
    }
  | {
      type: ToastActionType['REMOVE_TOAST']
      toastId?: ToastEntry['id']
    }

interface ToastState {
  toasts: ToastEntry[]
}

const toastRemovalTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const toastReducer = (currentToastState: ToastState, action: ToastReducerAction): ToastState => {
  switch (action.type) {
    case toastActionTypes.ADD_TOAST:
      return {
        ...currentToastState,
        toasts: [action.toast, ...currentToastState.toasts].slice(0, TOAST_LIMIT)
      }

    case toastActionTypes.UPDATE_TOAST:
      return {
        ...currentToastState,
        toasts: currentToastState.toasts.map((toastEntry) =>
          toastEntry.id === action.toast.id ? { ...toastEntry, ...action.toast } : toastEntry
        )
      }

    case toastActionTypes.DISMISS_TOAST: {
      const { toastId } = action
      const toastIds =
        toastId === undefined ? currentToastState.toasts.map((toastEntry) => toastEntry.id) : [toastId]

      for (const toastIdToRemove of toastIds) {
        if (toastRemovalTimeouts.has(toastIdToRemove)) continue

        toastRemovalTimeouts.set(
          toastIdToRemove,
          setTimeout(() => {
            toastRemovalTimeouts.delete(toastIdToRemove)
            dispatch({
              type: toastActionTypes.REMOVE_TOAST,
              toastId: toastIdToRemove
            })
          }, TOAST_REMOVE_DELAY)
        )
      }

      return {
        ...currentToastState,
        toasts: currentToastState.toasts.map((toastEntry) =>
          toastId === undefined || toastEntry.id === toastId
            ? {
                ...toastEntry,
                open: false
              }
            : toastEntry
        )
      }
    }
    case toastActionTypes.REMOVE_TOAST:
      return {
        ...currentToastState,
        toasts:
          action.toastId === undefined
            ? []
            : currentToastState.toasts.filter((toastEntry) => toastEntry.id !== action.toastId)
      }
    default:
      return currentToastState
  }
}

const toastStateListeners = new Set<() => void>()

let toastMemoryState: ToastState = { toasts: [] }

function dispatch(action: ToastReducerAction) {
  toastMemoryState = toastReducer(toastMemoryState, action)
  for (const listener of toastStateListeners) listener()
}

const subscribeToToastState = (onStoreChange: () => void) => {
  toastStateListeners.add(onStoreChange)
  return () => {
    toastStateListeners.delete(onStoreChange)
  }
}

const getToastStateSnapshot = () => toastMemoryState

function toast(toastOptions: Omit<ToastEntry, 'id'>) {
  const toastId = crypto.randomUUID()

  const dismiss = () => dispatch({ type: toastActionTypes.DISMISS_TOAST, toastId })

  dispatch({
    type: toastActionTypes.ADD_TOAST,
    toast: {
      ...toastOptions,
      id: toastId,
      open: true,
      onOpenChange: (isOpen) => {
        if (!isOpen) dismiss()
      }
    }
  })

  return {
    id: toastId,
    dismiss,
    update: (updates: Partial<ToastEntry>) =>
      dispatch({
        type: toastActionTypes.UPDATE_TOAST,
        toast: { ...updates, id: toastId }
      })
  }
}

function useToast() {
  const toastState = useSyncExternalStore(subscribeToToastState, getToastStateSnapshot, getToastStateSnapshot)

  return {
    ...toastState,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: toastActionTypes.DISMISS_TOAST, toastId })
  }
}

export { toast, useToast }
