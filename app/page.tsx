import { RecipeUploadForm } from "@/components/recipe-upload-form"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <RecipeUploadForm />
    </main>
  )
}
