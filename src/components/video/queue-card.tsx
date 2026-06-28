'use client'

import { ListVideo } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/lib/i18n/provider'
import type { VideoJob } from '@/types/video'
import VideoJobItem from './queue-item'

interface QueueCardProps {
  videoJobs: VideoJob[]
  onRemove: (videoJobId: string) => void
  onCancel: (videoJobId: string) => void
  onTogglePlayPause: (videoJobId: string) => void
}

export default function QueueCard({ videoJobs, ...queueItemHandlers }: QueueCardProps) {
  const { translate } = useLanguage()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
          <ListVideo aria-hidden="true" />
          {translate('queueCard.title')}
        </CardTitle>
      </CardHeader>
      <CardDescription className="px-6 pb-4">{translate('queueCard.description')}</CardDescription>
      <CardContent className="pt-2">
        {videoJobs.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground text-sm">{translate('queueCard.empty')}</p>
        ) : (
          <ul className="divide-y divide-border">
            {videoJobs.map((videoJob) => (
              <li key={videoJob.id} className="py-4 first:pt-0 last:pb-0">
                <VideoJobItem videoJob={videoJob} {...queueItemHandlers} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
