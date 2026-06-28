export function downloadFile(downloadUrl: string, downloadFileName: string) {
  const downloadLink = document.createElement('a')
  downloadLink.href = downloadUrl
  downloadLink.download = downloadFileName
  downloadLink.style.display = 'none'
  document.body.append(downloadLink)
  downloadLink.click()
  downloadLink.remove()
}
