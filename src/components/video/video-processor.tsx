'use client'

import { useVideoProcessor } from '@/hooks/use-video-processor'
import JobCard from '@/components/video/job-card'
import QueueCard from '@/components/video/queue-card'

export default function VideoProcessor() {
  const {
    videoJobs,
    selectedVideoFiles,
    interpolationFactor,
    setInterpolationFactor,
    videoFileInputRef,
    isFFmpegLoaded,
    isQueueArrowGlowing,
    isJobCardOpen,
    setIsJobCardOpen,
    handleVideoFilesChange,
    handleAddToQueue,
    handleRemoveSelectedVideoFile,
    handleRemoveVideoJob,
    handleCancelProcessing,
    handleToggleSelectedVideoFilePlayPause,
    handleToggleVideoJobPlayPause,
    handleRenameSelectedVideoFile,
    handleRenameVideoJob
  } = useVideoProcessor()

  return (
    <div className="space-y-4">
      <JobCard
        isJobCardOpen={isJobCardOpen}
        isFFmpegLoaded={isFFmpegLoaded}
        isQueueArrowGlowing={isQueueArrowGlowing}
        videoFileInputRef={videoFileInputRef}
        selectedVideoFiles={selectedVideoFiles}
        interpolationFactor={interpolationFactor}
        setIsJobCardOpen={setIsJobCardOpen}
        setInterpolationFactor={setInterpolationFactor}
        onVideoFilesChange={handleVideoFilesChange}
        onRemoveSelectedVideoFile={handleRemoveSelectedVideoFile}
        onToggleSelectedVideoFilePlayPause={handleToggleSelectedVideoFilePlayPause}
        onRenameSelectedVideoFile={handleRenameSelectedVideoFile}
        onAddToQueue={handleAddToQueue}
      />
      <QueueCard
        videoJobs={videoJobs}
        onRemove={handleRemoveVideoJob}
        onCancel={handleCancelProcessing}
        onTogglePlayPause={handleToggleVideoJobPlayPause}
        onRename={handleRenameVideoJob}
      />
    </div>
  )
}
