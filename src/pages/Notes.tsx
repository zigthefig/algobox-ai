import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  FileText,
  Code2,
  Folder,
  Star,
  MoreVertical,
  ChevronRight,
  Edit3,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock notes data
const notesData = [
  {
    id: "1",
    title: "Two Pointer Technique",
    excerpt: "The two pointer technique is commonly used for array problems where we need to find pairs...",
    linkedProblem: "Two Sum",
    linkedTopic: "Arrays",
    tags: ["pattern", "arrays"],
    starred: true,
    updatedAt: "2 hours ago",
  },
  {
    id: "2",
    title: "Hash Map for O(1) Lookup",
    excerpt: "Using hash maps to trade space for time. Store seen values as keys for constant time lookup...",
    linkedProblem: "Contains Duplicate",
    linkedTopic: "Hash Tables",
    tags: ["optimization", "hash-table"],
    starred: true,
    updatedAt: "1 day ago",
  },
  {
    id: "3",
    title: "Sliding Window Pattern",
    excerpt: "Sliding window is used to find subarrays or substrings that satisfy certain conditions...",
    linkedProblem: "Maximum Sum Subarray",
    linkedTopic: "Arrays",
    tags: ["pattern", "arrays"],
    starred: false,
    updatedAt: "3 days ago",
  },
  {
    id: "4",
    title: "Binary Search Variations",
    excerpt: "Different variations of binary search: finding first/last occurrence, search in rotated array...",
    linkedProblem: null,
    linkedTopic: "Binary Search",
    tags: ["algorithm", "searching"],
    starred: false,
    updatedAt: "1 week ago",
  },
  {
    id: "5",
    title: "Recursion Base Cases",
    excerpt: "Common mistakes with recursion: forgetting base cases, not reducing problem size properly...",
    linkedProblem: "Fibonacci",
    linkedTopic: "Recursion",
    tags: ["recursion", "mistakes"],
    starred: false,
    updatedAt: "1 week ago",
  },
];

const folders = [
  { id: "all", name: "All Notes", count: 5 },
  { id: "starred", name: "Starred", count: 2 },
  { id: "patterns", name: "Patterns", count: 3 },
  { id: "mistakes", name: "Common Mistakes", count: 1 },
];

export default function Notes() {
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [selectedNote, setSelectedNote] = useState(notesData[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = notesData.filter((note) => {
    if (selectedFolder === "starred") return note.starred;
    if (selectedFolder === "patterns") return note.tags.includes("pattern");
    if (selectedFolder === "mistakes") return note.tags.includes("mistakes");
    return true;
  }).filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-56 border-r border-border p-4"
      >
        <Button className="w-full mb-4">
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>

        <nav className="space-y-1">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                selectedFolder === folder.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                {folder.id === "starred" ? (
                  <Star className="h-4 w-4" />
                ) : (
                  <Folder className="h-4 w-4" />
                )}
                <span>{folder.name}</span>
              </div>
              <span className="text-xs">{folder.count}</span>
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Notes List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-80 border-r border-border flex flex-col"
      >
        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="flex-1 overflow-auto">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className={cn(
                "w-full border-b border-border p-4 text-left transition-colors",
                selectedNote?.id === note.id
                  ? "bg-primary/5"
                  : "hover:bg-muted/50"
              )}
            >
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-medium text-sm line-clamp-1">{note.title}</h3>
                {note.starred && <Star className="h-4 w-4 text-warning fill-warning" />}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {note.excerpt}
              </p>
              <div className="flex items-center gap-2">
                {note.linkedProblem && (
                  <Badge variant="outline" className="text-xs">
                    <Code2 className="mr-1 h-3 w-3" />
                    {note.linkedProblem}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">{note.updatedAt}</span>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Note Content */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 flex flex-col"
      >
        {selectedNote ? (
          <>
            {/* Note Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <h1 className="text-xl font-semibold">{selectedNote.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {selectedNote.linkedTopic && (
                    <Badge variant="info">
                      <LinkIcon className="mr-1 h-3 w-3" />
                      {selectedNote.linkedTopic}
                    </Badge>
                  )}
                  {selectedNote.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon-sm">
                  <Star className={cn("h-4 w-4", selectedNote.starred && "text-warning fill-warning")} />
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Note Body */}
            <div className="flex-1 overflow-auto p-6">
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground text-sm mb-4">Last updated: {selectedNote.updatedAt}</p>
                
                <p>{selectedNote.excerpt}</p>

                <h2 className="text-lg font-semibold mt-6 mb-3">Key Points</h2>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>Initialize two pointers at different positions</li>
                  <li>Move pointers based on the current comparison</li>
                  <li>Common positions: start/end, both at start, or fixed distance apart</li>
                </ul>

                <h2 className="text-lg font-semibold mt-6 mb-3">Code Example</h2>
                <div className="rounded-lg bg-code-bg border border-code-border p-4 font-mono text-sm">
                  <pre className="text-foreground">{`def two_sum(nums, target):
    left, right = 0, len(nums) - 1
    while left < right:
        current_sum = nums[left] + nums[right]
        if current_sum == target:
            return [left, right]
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    return []`}</pre>
                </div>

                <h2 className="text-lg font-semibold mt-6 mb-3">Related Problems</h2>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                    <ChevronRight className="mr-1 h-3 w-3" />
                    Two Sum II
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                    <ChevronRight className="mr-1 h-3 w-3" />
                    3Sum
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                    <ChevronRight className="mr-1 h-3 w-3" />
                    Container With Most Water
                  </Badge>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a note to view</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
