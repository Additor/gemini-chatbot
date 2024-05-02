'use client'
import React, { ReactElement, useState } from 'react'
import ReactCopyToClipboard from 'react-copy-to-clipboard'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { Button } from '../ui/button'
import { toast } from 'sonner'

type Props = {
  text: string
  successMessgae?: string
  failMessage?: string
}

export function CopyButton({
  text,
  successMessgae,
  failMessage
}: Props): ReactElement {
  const [copied, setCopied] = useState(false)

  const handleCopy = (t: string, result: boolean): void => {
    if (result) {
      setCopied(true)
      toast(
        <div className="text-slate-800">
          {successMessgae ?? 'Text has been copied.'}
        </div>
      )
      setTimeout(() => {
        setCopied(false)
      }, 5000)
    } else {
      toast(
        <div className="text-red-600">{failMessage ?? 'Failed to copy.'}</div>
      )
    }
  }

  return (
    <ReactCopyToClipboard text={text} onCopy={handleCopy}>
      {copied ? (
        <Button variant="ghost" className="inline-flex gap-1">
          <IconCheck size={16} color="rgb(148 163 184)" />
          <span>Copied</span>
        </Button>
      ) : (
        <Button variant="outline" className="inline-flex gap-1">
          <IconCopy size={16} color="rgb(148 163 184)" />
          <span>Copy</span>
        </Button>
      )}
    </ReactCopyToClipboard>
  )
}
