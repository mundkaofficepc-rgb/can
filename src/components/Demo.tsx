import { ExpandingSearchDock } from "./ui/expanding-search-dock-shadcnui"

export default function Demo() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] p-8">
      <ExpandingSearchDock onSearch={(query) => console.log("Searching for:", query)} />
    </div>
  )
}
