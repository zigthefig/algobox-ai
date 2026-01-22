import { useState, useMemo, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
  Search, Play, ChevronLeft, ChevronRight, Check, X, Loader2,
  Lightbulb, RotateCcw, Eye, Send, Bot, ArrowLeft, Filter,
  ChevronDown, ThumbsUp, MessageSquare, Bookmark, Share2, Trash2, User, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PROBLEMS, Problem } from "@/lib/problems/problemLibrary";
import { D3CodeVisualization } from "@/components/visualisation/D3CodeVisualization";
import ReactMarkdown from "react-markdown";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import GeneratingLoader from "@/components/ui/GeneratingLoader";
import { useProgress } from "@/hooks/useProgress";
import { useFavorites } from "@/hooks/useFavorites";
import { useNotes } from "@/hooks/useNotes";
import { analytics } from "@/lib/analytics";

type Language = "python" | "javascript" | "cpp";
type Difficulty = "beginner" | "intermediate" | "advanced";

const DIFFICULTY_CONFIG = {
  beginner: { label: "Easy", color: "text-emerald-500" },
  intermediate: { label: "Med.", color: "text-amber-500" },
  advanced: { label: "Hard", color: "text-red-500" },
};

export default function Practice() {
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState<Language>("javascript");
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [descTab, setDescTab] = useState<"description" | "solutions" | "notes">("description");
  const [outputTab, setOutputTab] = useState<"testcase" | "result" | "visualization">("testcase");
  const [visualizationData, setVisualizationData] = useState<any>(null);
  const [currentVisStep, setCurrentVisStep] = useState(0);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // User data hooks
  const { progress, updateProgress, getSolvedCount } = useProgress();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { saveNote, getNoteForProblem } = useNotes(selectedProblemId || undefined);
  const [noteContent, setNoteContent] = useState("");

  // Update note content when problem changes
  useEffect(() => {
    if (selectedProblemId) {
      const note = getNoteForProblem(selectedProblemId);
      setNoteContent(note?.content || "");
    }
  }, [selectedProblemId, getNoteForProblem]);

  const selectedProblem = useMemo(() =>
    PROBLEMS.find(p => p.id === selectedProblemId) || null
    , [selectedProblemId]);

  const filteredProblems = useMemo(() => {
    if (!searchQuery) return PROBLEMS;
    const q = searchQuery.toLowerCase();
    return PROBLEMS.filter(p => p.title.toLowerCase().includes(q));
  }, [searchQuery]);

  // Update openProblem to load saved code
  const openProblem = (problem: Problem) => {
    setSelectedProblemId(problem.id);
    const saved = progress[problem.id];
    if (saved?.code) {
      setCode(saved.code);
      setLanguage((saved.language as Language) || "javascript");
    } else {
      setCode(problem.starterCode[language]);
    }
    setTestResults(problem.testCases.map(tc => ({ ...tc, passed: null })));
    setVisualizationData(null);
    setChatMessages([]);

    analytics.track("lab_started", {
      labId: problem.id,
      labTitle: problem.title,
      difficulty: problem.difficulty
    });
  };

  const goBack = () => {
    setSelectedProblemId(null);
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    // Only reset code if no saved progress or if user confirms
    if (selectedProblem && !progress[selectedProblem.id]?.code) {
      setCode(selectedProblem.starterCode[newLang]);
    } else if (selectedProblem) {
      // Optional: Prompt user? For now, just keep current code or starter if empty
      if (!code) setCode(selectedProblem.starterCode[newLang]);
    }
  };

  const handleRun = async (visualize = false) => {
    if (!selectedProblem) return;
    setIsRunning(true);
    if (visualize) setVisualizationData(null);

    try {
      const { data, error } = await supabase.functions.invoke("debug-code", {
        body: {
          code,
          language,
          tests: selectedProblem.testCases.map(tc => ({ input: tc.input, expected: tc.expected })),
          visualize,
        },
      });
      if (error) throw error;

      if (visualize && data?.visualization) {
        setVisualizationData(data.visualization);
        setCurrentVisStep(0);
        setOutputTab("visualization");
      } else if (data?.execution?.tests) {
        const results = selectedProblem.testCases.map((tc, idx) => ({
          ...tc,
          passed: data.execution.tests[idx]?.passed ?? null,
          actual: data.execution.tests[idx]?.stdout,
        }));
        setTestResults(results);
        setOutputTab("result");

        // Save progress
        const allPassed = results.every(r => r.passed);
        await updateProgress(selectedProblem.id, {
          status: allPassed ? "solved" : "attempted",
          code,
          language,
        });

        if (allPassed) {
          toast.success("All tests passed! Problem solved! 🎉");

          analytics.track("lab_completed", {
            labId: selectedProblem.id,
            labTitle: selectedProblem.title,
            attempts: testResults.length
          });

          // Emit Inngest Event via our Gateway
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            fetch('/api/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: "user.completed.lab",
                data: {
                  userId: user.id,
                  labId: selectedProblem.id,
                  score: 100,
                  timeSpentSeconds: 0, // TODO: Track actual time
                  labType: "algo"
                }
              })
            }).catch(console.error);
          }
        }
      }
    } catch (err: any) {
      toast.error("Execution failed");
    } finally {
      setIsRunning(false);
    }
  };

  const askAI = async (msg?: string) => {
    const message = msg || aiInput.trim();
    if (!message || !selectedProblem) return;
    setAiInput("");

    // Add user message
    setChatMessages(prev => [...prev, { role: "user", content: message }]);
    setIsAiLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Use our new Go Serverless API for AI requests
      const response = await fetch('/api/go/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || "anonymous",
          prompt: message,
          context: `Problem: ${selectedProblem.title}\n${selectedProblem.description}`
        })
      });

      if (!response.ok) throw new Error("AI Service Unavailable");

      const data = await response.json();

      // Since the Go API is async (Event-Driven), we acknowledge receipt
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: `🤖 ${data.message || "I'm analyzing your request in the background."}\n\n(This triggers an Inngest workflow!)`
      }]);

    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: "assistant", content: `Error: ${err?.message || "Failed to connect"}` }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const clearChat = () => setChatMessages([]);

  // ============ PROBLEM LIST VIEW ============
  if (!selectedProblem) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <h1 className="text-base sm:text-lg font-semibold">Problem List</h1>
            <span className="text-xs sm:text-sm text-muted-foreground">{getSolvedCount()}/{PROBLEMS.length} Solved</span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="px-4 sm:px-6 py-2 sm:py-3 border-b border-border flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 sm:h-9 text-sm bg-muted/30"
            />
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground text-xs sm:text-sm px-2 sm:px-3">
            <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </div>

        {/* Problem List */}
        <ScrollArea className="h-[calc(100vh-100px)] sm:h-[calc(100vh-120px)]">
          <div className="divide-y divide-border">
            {filteredProblems.map((problem, idx) => {
              const problemProgress = progress[problem.id];
              const isSolved = problemProgress?.status === "solved";
              const isAttempted = problemProgress?.status === "attempted";
              const isFav = isFavorite(problem.id);

              return (
                <div
                  key={problem.id}
                  onClick={() => openProblem(problem)}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 flex items-center gap-3 sm:gap-4 hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <div className="w-4 sm:w-5 text-center flex-shrink-0">
                    {isSolved ? (
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                    ) : isAttempted ? (
                      <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-amber-500" />
                    ) : (
                      <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full border border-muted-foreground/30" />
                    )}
                  </div>
                  <span className="flex-1 text-xs sm:text-sm truncate">{idx + 1}. {problem.title}</span>
                  {isFav && <Star className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 fill-amber-500 flex-shrink-0" />}
                  <span className={cn("text-[10px] sm:text-xs font-medium flex-shrink-0", DIFFICULTY_CONFIG[problem.difficulty].color)}>
                    {DIFFICULTY_CONFIG[problem.difficulty].label}
                  </span>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // ============ EDITOR VIEW ============
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <div className="h-10 sm:h-11 border-b border-border flex items-center px-2 sm:px-4 gap-1 sm:gap-3 shrink-0">
        <button onClick={goBack} className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Problem List</span>
        </button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={() => handleRun(true)} disabled={isRunning} className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3">
          <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
          <span className="hidden sm:inline">Visualize</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleRun(false)} disabled={isRunning} className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3">
          <Play className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
          <span className="hidden sm:inline">Run</span>
        </Button>
        <Button size="sm" onClick={() => handleRun(false)} disabled={isRunning} className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3 bg-emerald-600 hover:bg-emerald-700">
          {isRunning ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin sm:mr-1" /> : <Check className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />}
          <span className="hidden sm:inline">Submit</span>
        </Button>
      </div>

      {/* Main Content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left: Problem Description */}
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <div className="h-full flex flex-col border-r border-border">
            <Tabs value={descTab} onValueChange={(v) => setDescTab(v as typeof descTab)} className="flex-1 flex flex-col">
              <TabsList className="h-10 w-full justify-start rounded-none border-b border-border bg-transparent px-4 gap-4">
                <TabsTrigger value="description" className="text-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Description</TabsTrigger>
                <TabsTrigger value="solutions" className="text-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Solutions</TabsTrigger>
                <TabsTrigger value="notes" className="text-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="flex-1 overflow-auto p-4 mt-0">
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h1 className="text-xl font-medium">{filteredProblems.findIndex(p => p.id === selectedProblemId) + 1}. {selectedProblem.title}</h1>
                      <Button variant="ghost" size="icon-sm" onClick={() => toggleFavorite(selectedProblem.id)}>
                        <Star className={cn("h-5 w-5", isFavorite(selectedProblem.id) ? "fill-amber-500 text-amber-500" : "text-muted-foreground")} />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={cn("text-xs border-0", DIFFICULTY_CONFIG[selectedProblem.difficulty].color, "bg-current/10")}>
                        {DIFFICULTY_CONFIG[selectedProblem.difficulty].label}
                      </Badge>
                      {selectedProblem.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs text-muted-foreground">{tag}</Badge>
                      ))}
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        <Lightbulb className="h-3 w-3 mr-1" /> Hint
                      </Badge>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {selectedProblem.description}
                  </div>

                  {/* Examples */}
                  {selectedProblem.examples.map((ex, i) => (
                    <div key={i} className="space-y-1">
                      <div className="text-sm font-medium">Example {i + 1}:</div>
                      <div className="bg-muted/30 rounded-lg p-3 text-sm font-mono space-y-1">
                        <div><span className="font-semibold">Input:</span> {ex.input}</div>
                        <div><span className="font-semibold">Output:</span> {ex.output}</div>
                        {ex.explanation && (
                          <div className="text-muted-foreground"><span className="font-semibold">Explanation:</span> {ex.explanation}</div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Constraints */}
                  <div>
                    <div className="text-sm font-medium mb-2">Constraints:</div>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      {selectedProblem.constraints.map((c, i) => (
                        <li key={i} className="font-mono text-xs">{c}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Footer Stats */}
                  <div className="flex items-center gap-4 pt-4 border-t border-border text-muted-foreground text-xs">
                    <button className="flex items-center gap-1 hover:text-foreground"><ThumbsUp className="h-3.5 w-3.5" /> 1.2K</button>
                    <button className="flex items-center gap-1 hover:text-foreground"><MessageSquare className="h-3.5 w-3.5" /> 856</button>
                    <button className="flex items-center gap-1 hover:text-foreground"><Bookmark className="h-3.5 w-3.5" /></button>
                    <button className="flex items-center gap-1 hover:text-foreground"><Share2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="solutions" className="flex-1 overflow-auto p-4 mt-0">
                <div className="text-sm text-muted-foreground">Solutions will appear here after solving the problem.</div>
              </TabsContent>
              <TabsContent value="notes" className="flex-1 overflow-auto p-4 mt-0">
                <div className="flex flex-col h-full gap-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">My Notes</h2>
                    <Button size="sm" onClick={() => saveNote(selectedProblem.id, noteContent).then(() => toast.success("Note saved!"))}>Save Note</Button>
                  </div>
                  <textarea
                    className="flex-1 w-full p-4 rounded-md border border-border bg-muted/30 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Write your notes, thoughts, or pseudo-code here..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Middle: Code Editor */}
        <ResizablePanel defaultSize={45} minSize={30}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={65} minSize={30}>
              <div className="h-full flex flex-col">
                {/* Code Header */}
                <div className="h-10 border-b border-border flex items-center px-4 gap-2 shrink-0">
                  <span className="text-sm font-medium text-muted-foreground">Code</span>
                  <div className="flex-1" />
                  <div className="flex items-center gap-1">
                    {(["javascript", "python", "cpp"] as Language[]).map((lang) => (
                      <Button
                        key={lang}
                        variant={language === lang ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => handleLanguageChange(lang)}
                        className="text-xs h-7"
                      >
                        {lang === "cpp" ? "C++" : lang === "javascript" ? "JavaScript" : "Python"}
                      </Button>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="h-7" onClick={() => selectedProblem && setCode(selectedProblem.starterCode[language])}>
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Editor */}
                <div className="flex-1">
                  <Editor
                    height="100%"
                    language={language === "cpp" ? "cpp" : language}
                    value={code}
                    onChange={(val) => setCode(val || "")}
                    theme="vs-dark"
                    options={{ minimap: { enabled: false }, fontSize: 14, lineNumbers: "on", scrollBeyondLastLine: false, automaticLayout: true, padding: { top: 12 } }}
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Output Panel */}
            <ResizablePanel defaultSize={35} minSize={15} maxSize={60}>
              <div className="h-full flex flex-col border-t border-border">
                <Tabs value={outputTab} onValueChange={(v) => setOutputTab(v as typeof outputTab)} className="flex-1 flex flex-col">
                  <TabsList className="h-9 w-full justify-start rounded-none border-b border-border bg-transparent px-4 gap-4">
                    <TabsTrigger value="testcase" className="text-xs">Testcase</TabsTrigger>
                    <TabsTrigger value="result" className="text-xs">Test Result</TabsTrigger>
                    <TabsTrigger value="visualization" className="text-xs">Visualization</TabsTrigger>
                  </TabsList>

                  <TabsContent value="testcase" className="flex-1 overflow-auto p-3 mt-0">
                    <div className="text-xs text-muted-foreground">You must run your code first</div>
                  </TabsContent>

                  <TabsContent value="result" className="flex-1 overflow-auto p-3 mt-0">
                    <div className="space-y-2">
                      {testResults.map((tc, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          {tc.passed === true && <Check className="h-4 w-4 text-emerald-500 shrink-0" />}
                          {tc.passed === false && <X className="h-4 w-4 text-red-500 shrink-0" />}
                          {tc.passed === null && <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />}
                          <div className="font-mono">
                            <span className="text-muted-foreground">Input:</span> {tc.input}
                            <span className="mx-2 text-muted-foreground">→</span>
                            <span className="text-muted-foreground">Expected:</span> {tc.expected}
                            {tc.actual !== undefined && (
                              <span className={tc.passed ? "text-emerald-500" : "text-red-500"}> Got: {tc.actual || "(empty)"}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="visualization" className="flex-1 overflow-hidden mt-0">
                    {visualizationData?.steps?.length > 0 ? (
                      <div className="h-full flex flex-col">
                        <div className="flex-1 overflow-hidden">
                          <D3CodeVisualization step={visualizationData.steps[currentVisStep]} />
                        </div>
                        <div className="h-8 flex items-center justify-center gap-2 border-t border-border">
                          <Button variant="ghost" size="sm" className="h-6" onClick={() => setCurrentVisStep(Math.max(0, currentVisStep - 1))} disabled={currentVisStep === 0}>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-xs text-muted-foreground">{currentVisStep + 1} / {visualizationData.steps.length}</span>
                          <Button variant="ghost" size="sm" className="h-6" onClick={() => setCurrentVisStep(Math.min(visualizationData.steps.length - 1, currentVisStep + 1))} disabled={currentVisStep >= visualizationData.steps.length - 1}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                        <Button variant="outline" size="sm" onClick={() => handleRun(true)} disabled={isRunning}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> Visualize
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right: AI Assistant */}
        <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
          <div className="h-full flex flex-col border-l border-border">
            <div className="h-10 border-b border-border flex items-center px-4 justify-between">
              <div className="flex items-center">
                <Bot className="h-4 w-4 mr-2 text-amber-500" />
                <span className="text-sm font-medium">AI Assistant</span>
              </div>
              {chatMessages.length > 0 && (
                <Button variant="ghost" size="sm" className="h-6 px-2" onClick={clearChat}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-2">🤖</div>
                    <p className="text-sm text-muted-foreground">Stuck? I can guide you through every step.</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => askAI("Give me a hint for this problem")}>
                      <Lightbulb className="h-3.5 w-3.5 mr-1" /> Get Hint
                    </Button>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                      {msg.role === "assistant" && (
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                          <Bot className="h-3.5 w-3.5 text-amber-500" />
                        </div>
                      )}
                      <div className={cn(
                        "max-w-[85%] rounded-lg px-3 py-2",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}>
                        {msg.role === "user" ? (
                          <p className="text-sm">{msg.content}</p>
                        ) : (
                          <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                code: ({ node, className, children, ...props }) => {
                                  const isInline = !className;
                                  return isInline ? (
                                    <code className="bg-slate-800 px-1 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>
                                  ) : (
                                    <pre className="bg-slate-900 p-3 rounded-lg overflow-x-auto text-xs my-2">
                                      <code className="font-mono" {...props}>{children}</code>
                                    </pre>
                                  );
                                },
                                p: ({ children }) => <p className="mb-2 text-sm leading-relaxed">{children}</p>,
                                h3: ({ children }) => <h3 className="text-sm font-semibold mt-3 mb-1">{children}</h3>,
                                ul: ({ children }) => <ul className="list-disc list-inside text-sm space-y-1 mb-2">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside text-sm space-y-1 mb-2">{children}</ol>,
                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <User className="h-3.5 w-3.5 text-primary" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isAiLoading && (
                  <div className="flex gap-2 items-center">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                      <Bot className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    <div className="bg-muted/50 rounded-lg px-4 py-2 min-w-[150px] flex justify-center">
                      <GeneratingLoader className="scale-[0.6] origin-center m-0 h-12" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask a question..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && askAI()}
                  className="h-8 text-xs"
                />
                <Button size="sm" className="h-8 px-2" onClick={() => askAI()} disabled={isAiLoading}>
                  {isAiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
