'use client'

import { ListVideo } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useAnimatedList } from '@/hooks/use-animated-list'
import { useLanguage } from '@/lib/i18n/provider'
import type { VideoJob } from '@/types/video'
import { ContentSwitch } from './content-switch'
import { AnimatedHeight } from './animated-height'
import VideoJobItem from './queue-item'

interface QueueCardProps {
  videoJobs: VideoJob[]
  onRemove: (videoJobId: string) => void
  onCancel: (videoJobId: string) => void
  onTogglePlayPause: (videoJobId: string) => void
}

export default function QueueCard({ videoJobs, ...queueItemHandlers }: QueueCardProps) {
  const { translate } = useLanguage()
  const { animatedItems, handleTransitionEnd } = useAnimatedList(videoJobs)

  const isEmpty = animatedItems.length === 0

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
        <ContentSwitch
          contentKey={isEmpty ? 'empty' : 'list'}
          renderContent={(key) =>
            key === 'empty' ? (
              <p className="text-center py-12 text-muted-foreground text-sm">
                {translate('queueCard.empty')}
              </p>
            ) : (
              <ul>
                {animatedItems.map((animatedVideoJob, index) => (
                  <li key={animatedVideoJob.id}>
                    <AnimatedHeight
                      isOpen={animatedVideoJob.isOpen}
                      onTransitionEnd={() => handleTransitionEnd(animatedVideoJob.id)}
                      innerClassName={index === 0 ? 'pb-4' : 'py-4 border-t border-border'}
                    >
                      <VideoJobItem videoJob={animatedVideoJob} {...queueItemHandlers} />
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
