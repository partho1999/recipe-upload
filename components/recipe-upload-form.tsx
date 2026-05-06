"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
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
  title: string
  image_path: string
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

  const [recipes, setRecipes] = useState<any[]>([])
  const [loadingRecipes, setLoadingRecipes] = useState(false)

  // ---------------- FETCH CATEGORIES ----------------
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("https://t-squaretech.co/api/recipe/categories")
        if (!response.ok) throw new Error("Failed to fetch categories")

        const data = await response.json()
        setCategories(data?.detail || [])
      } catch (error) {
        setCategoryError("Failed to load categories. Please refresh the page.")
        console.error(error)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // ---------------- FETCH RECIPES ----------------
  const fetchRecipes = async (catId: string) => {
    if (!catId) return

    try {
      setLoadingRecipes(true)

      const res = await fetch(
        `https://t-squaretech.co/api/recipe/recipe/list?category_id=${catId}`
      )

      const data = await res.json()

      // ✅ ALWAYS FORCE ARRAY
      const list = Array.isArray(data?.detail)
        ? data.detail
        : Array.isArray(data)
        ? data
        : []

      setRecipes(list)
    } catch (err) {
      console.error("Failed to load recipes", err)
      setRecipes([])
    } finally {
      setLoadingRecipes(false)
    }
  }

  // ---------------- AUTO LOAD RECIPES ----------------
  useEffect(() => {
    if (categoryId) {
      fetchRecipes(categoryId)
    }
  }, [categoryId])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setImageFile(file)
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setContentFile(file)
  }

  // ---------------- SUBMIT ----------------
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

      if (!response.ok) throw new Error("Upload failed")

      await response.json()

      setSubmitStatus("success")
      setSubmitMessage("Recipe uploaded successfully!")

      // reset form
      setTitle("")
      setCategoryId("")
      setImageFile(null)
      setContentFile(null)

      if (imageInputRef.current) imageInputRef.current.value = ""
      if (contentInputRef.current) contentInputRef.current.value = ""

      // 🔥 refresh table after upload
      await fetchRecipes(categoryId)

    } catch (error) {
      setSubmitStatus("error")
      setSubmitMessage("Failed to upload recipe. Please try again.")
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

          {/* CATEGORY */}
          <div className="space-y-2">
            <Label>Category</Label>

            {loadingCategories ? (
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="animate-spin size-4" />
                Loading...
              </div>
            ) : categoryError ? (
              <div className="text-red-500 text-sm">{categoryError}</div>
            ) : (
              <Select
                value={categoryId}
                onValueChange={(value) => {
                  setCategoryId(value)
                  fetchRecipes(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>

                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* TITLE */}
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {/* IMAGE */}
          <div>
            <Label>Image</Label>
            <Input 
              type="file" 
              ref={imageInputRef} 
              onChange={handleImageChange} 
            />
          </div>

          {/* CONTENT */}
          <div>
            <Label>PDF</Label>
            <Input type="file" ref={contentInputRef} onChange={handleContentChange} />
          </div>

          {/* STATUS */}
          {submitMessage && (
            <p className={submitStatus === "success" ? "text-green-600" : "text-red-600"}>
              {submitMessage}
            </p>
          )}

          {/* BUTTON */}
          <Button disabled={isSubmitting}>
            {isSubmitting ? "Uploading..." : "Upload"}
          </Button>
        </form>

        {/* ---------------- TABLE ---------------- */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Recipes</h3>

          {loadingRecipes ? (
            <p>Loading...</p>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[400px]">
                
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {recipes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No recipes
                      </TableCell>
                    </TableRow>
                  ) : (
                    recipes.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="whitespace-nowrap">{r.id}</TableCell>
                        <TableCell>{r.title}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>

              </Table>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  )
}