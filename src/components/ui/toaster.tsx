'use client'

import {
  ToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport
} from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/lib/i18n/provider'

export function Toaster() {
  const { translate } = useLanguage()
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map((toastEntry) => (
        <Toast key={toastEntry.id} {...toastEntry}>
          <div className="grid gap-1">
            {toastEntry.title && <ToastTitle>{toastEntry.title}</ToastTitle>}
            {toastEntry.description && <ToastDescription>{toastEntry.description}</ToastDescription>}
          </div>
          {toastEntry.action}
          <ToastClose aria-label={translate('toast.closeAriaLabel')} />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
