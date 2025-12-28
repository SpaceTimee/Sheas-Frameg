'use client'

import { ListVideo } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import ProcessingVideoItem from './processing-item'
import { useLanguage } from '@/lib/i18n/provider'
import type { VideoFile } from '@/types/video'

interface QueueCardProps extends Omit<React.ComponentProps<typeof ProcessingVideoItem>, 'video'> {
  videos: VideoFile[]
}

export default function QueueCard({ videos, ...rest }: QueueCardProps) {
  const { t } = useLanguage()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
          <ListVideo />
          {t('queueCard.title')}
        </CardTitle>
        <CardDescription className="pt-2">{t('queueCard.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {videos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <p>{t('queueCard.empty')}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {videos.map((video) => (
              <ProcessingVideoItem key={video.id} video={video} {...rest} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
