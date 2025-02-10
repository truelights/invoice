"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import Image from "next/image"

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void
}

export default function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "azam12")

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/dmaxqrcjm/image/upload`, {
        method: "POST",
        body: formData,
      })

      const responseText = await response.text()

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}. ${responseText}`)
      }

      const data = JSON.parse(responseText)
      setImageUrl(data.secure_url)
      onImageUpload(data.secure_url)
      setError(null)
    } catch (error) {
      console.error("Full error object:", error)
      setImageUrl(null)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Input type="file" onChange={handleUpload} accept="image/*" />
      {imageUrl && (
        <div className="mt-4">
          <Image width={100} height={100} src={imageUrl || "/placeholder.svg"} alt="Uploaded" className="max-w-xs" />
        </div>
      )}
      {error && <div className="mt-4 text-red-500">{error}</div>}
    </div>
  )
}
