'use client'

import { ListVideo } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useAnimatedList } from '@/hooks/use-animated-list'
import { useLanguage } from '@/lib/i18n/provider'
import type { VideoJob } from '@/types/video'
import { ContentSwitch } from '@/components/video/content-switch'
import { AnimatedHeight } from '@/components/video/animated-height'
import VideoJobItem from '@/components/video/queue-item'

interface QueueCardProps {
  videoJobs: VideoJob[]
  onRemove: (videoJobId: string) => void
  onCancel: (videoJobId: string) => void
  onTogglePlayPause: (videoJobId: string) => void
  onRename: (videoJobId: string, customName: string) => void
}

export default function QueueCard({ videoJobs, ...queueItemHandlers }: QueueCardProps) {
  const { translate } = useLanguage()
  const { animatedItems, handleTransitionEnd } = useAnimatedList(videoJobs)

  const isEmpty = animatedItems.length === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-xl">
          <ListVideo aria-hidden="true" />
          {translate('queueCard.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-6">
        <CardDescription>{translate('queueCard.description')}</CardDescription>
        <ContentSwitch
          contentKey={isEmpty ? 'empty' : 'list'}
          renderContent={(key) =>
            key === 'empty' ? (
              <p className="text-muted-foreground py-12 text-center text-sm">
                {translate('queueCard.empty')}
              </p>
            ) : (
              <ul className="space-y-6">
                {animatedItems.map(({ item, isOpen }) => (
                  <li key={item.id}>
                    <AnimatedHeight isOpen={isOpen} onTransitionEnd={() => handleTransitionEnd(item.id)}>
                      <VideoJobItem videoJob={item} {...queueItemHandlers} />
                    </AnimatedHeight>
                  </li>
                ))}
              </ul>
            )
          }
        />
      </CardContent>
    </Card>
  )
}
