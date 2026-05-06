"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Upload, FileText, ImageIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

interface Category {
  id: number
  name: string
}

export function RecipeUploadForm() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  
  const [title, setTitle] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [contentFile, setContentFile] = useState<File | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [submitMessage, setSubmitMessage] = useState("")
  
  const imageInputRef = useRef<HTMLInputElement>(null)
  const contentInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("https://t-squaretech.co/api/recipe/categories")
        if (!response.ok) {
          throw new Error("Failed to fetch categories")
        }
        const data = await response.json()
        setCategories(data.data || data || [])
      } catch (error) {
        setCategoryError("Failed to load categories. Please refresh the page.")
        console.error("Error fetching categories:", error)
      } finally {
        setLoadingCategories(false)
      }
    }
    
    fetchCategories()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setContentFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !categoryId || !imageFile || !contentFile) {
      setSubmitStatus("error")
      setSubmitMessage("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")
    setSubmitMessage("")

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("image_path", imageFile)
      formData.append("content_path", contentFile)

      const response = await fetch(
        `https://t-squaretech.co/api/recipe/recipe/upload?category_id=${categoryId}`,
        {
          method: "POST",
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error("Failed to upload recipe")
      }

      const result = await response.json()
      setSubmitStatus("success")
      setSubmitMessage("Recipe uploaded successfully!")
      
      // Reset form
      setTitle("")
      setCategoryId("")
      setImageFile(null)
      setContentFile(null)
      if (imageInputRef.current) imageInputRef.current.value = ""
      if (contentInputRef.current) contentInputRef.current.value = ""
      
    } catch (error) {
      setSubmitStatus("error")
      setSubmitMessage("Failed to upload recipe. Please try again.")
      console.error("Upload error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="size-5" />
          Upload Recipe
        </CardTitle>
        <CardDescription>
          Add a new recipe by filling in the details below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Select */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            {loadingCategories ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading categories...
              </div>
            ) : categoryError ? (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="size-4" />
                {categoryError}
              </div>
            ) : (
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Recipe Title</Label>
            <Input
              id="title"
              placeholder="Enter recipe title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Recipe Image</Label>
            <div className="flex items-center gap-3">
              <label
                htmlFor="image"
                className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-muted-foreground/50 hover:bg-muted"
              >
                {imageFile ? (
                  <div className="flex flex-col items-center gap-1 text-center">
                    <ImageIcon className="size-6 text-primary" />
                    <span className="text-xs text-muted-foreground">Selected</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <ImageIcon className="size-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Upload</span>
                  </div>
                )}
              </label>
              <input
                ref={imageInputRef}
                id="image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              {imageFile && (
                <div className="flex-1 truncate text-sm text-muted-foreground">
                  {imageFile.name}
                </div>
              )}
            </div>
          </div>

          {/* Content/PDF Upload */}
          <div className="space-y-2">
            <Label htmlFor="content">Recipe Content (PDF)</Label>
            <div className="flex items-center gap-3">
              <label
                htmlFor="content"
                className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-muted-foreground/50 hover:bg-muted"
              >
                {contentFile ? (
                  <div className="flex flex-col items-center gap-1 text-center">
                    <FileText className="size-6 text-primary" />
                    <span className="text-xs text-muted-foreground">Selected</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <FileText className="size-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Upload</span>
                  </div>
                )}
              </label>
              <input
                ref={contentInputRef}
                id="content"
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleContentChange}
              />
              {contentFile && (
                <div className="flex-1 truncate text-sm text-muted-foreground">
                  {contentFile.name}
                </div>
              )}
            </div>
          </div>

          {/* Status Message */}
          {submitStatus !== "idle" && (
            <div
              className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                submitStatus === "success"
                  ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                  : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
              }`}
            >
              {submitStatus === "success" ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <AlertCircle className="size-4" />
              )}
              {submitMessage}
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 size-4" />
                Upload Recipe
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
