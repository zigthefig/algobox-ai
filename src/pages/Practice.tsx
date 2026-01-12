import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import {
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  MessageSquare,
  Settings,
  Maximize2,
  Send,
  Bot,
  User,
  Trash2,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import VisualCanvas from "@/components/visualisation/VisualCanvas";


// Mock problem data
const currentProblem = {
  id: "two-sum",
  title: "Two Sum",
  difficulty: "beginner" as const,
  description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
    },
  ],
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists.",
  ],
  hints: [
    "A brute force approach would be O(n²). Can you do better?",
    "Try using a hash map to store the values you've seen.",
    "For each element, check if target - element exists in the hash map.",
  ],
  tags: ["Array", "Hash Table"],
  starterCode: {
    python: `def twoSum(nums: list[int], target: int) -> list[int]:
    # Your code here
    pass`,
    javascript: `function twoSum(nums, target) {
    // Your code here
    
}`,
    cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
        
    }
};`,

  },
};

const testCases = [
  { input: "[2,7,11,15], 9", expected: "[0,1]", passed: null as boolean | null },
  { input: "[3,2,4], 6", expected: "[1,2]", passed: null as boolean | null },
  { input: "[3,3], 6", expected: "[0,1]", passed: null as boolean | null },
];

type Language = "python" | "javascript" | "cpp";

export default function Practice() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState(currentProblem.starterCode[language]);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"problem" | "hints">("problem");
  const [activeOutputTab, setActiveOutputTab] = useState<"execution" | "visualization">("execution");
  const [showHints, setShowHints] = useState<number[]>([]);
  const [testResults, setTestResults] = useState(testCases);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [inputValue, setInputValue] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [executionData, setExecutionData] = useState<any>(null);
  const [visualizationData, setVisualizationData] = useState<any>(null);
  const [currentVisStep, setCurrentVisStep] = useState(0);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setCode(currentProblem.starterCode[newLang]);
    // Reset output and visualization when language changes
    setOutput(null);
    setVisualizationData(null);
    setExecutionData(null);
  };

  const handleRun = async (visualize = false) => {
    setIsRunning(true);
    setOutput(null);
    setExecutionData(null);

    if (!visualize) {
      setVisualizationData(null);
      setActiveOutputTab("execution");
    } else {
      setActiveOutputTab("visualization");
    }

    try {
      // Prepare tests in the format expected by the server
      const testsPayload = testResults.map((t) => ({ input: t.input, expected: t.expected }));

      // Dynamically import the Supabase client at runtime
      let supabase: any;
      try {
        const mod = await import("@/integrations/supabase/client");
        supabase = (mod as any).supabase;
      } catch (err) {
        console.error("Failed to import supabase client:", err);
        setOutput("Supabase client not available in this environment.");
        if ((err as any)?.message) {
          setOutput((prev) => `${prev}\n\n${(err as any).message}`);
        }
        toast.error("Supabase client not available");
        return;
      }

      if (!supabase || typeof supabase.functions?.invoke !== "function") {
        const msg = 'Supabase functions are not available. Ensure VITE_SUPABASE_URL is set and functions are deployed.';
        console.warn(msg);
        setOutput(msg);
        toast.error("Supabase not configured");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("debug-code", {
          body: { code, language, tests: testsPayload, skipAnalysis: true, visualize },
        });

        if (error) {
          console.error("Supabase function error:", error);
          setOutput(`Error: ${error.message || JSON.stringify(error)}`);
          toast.error("Failed to run code");
          return;
        }

        const analysis = data?.analysis ?? null;
        const execution = data?.execution ?? null;
        const visualization = data?.visualization ?? null;

        // Update test results if execution provides tests
        if (execution?.tests && Array.isArray(execution.tests)) {
          const updated = testResults.map((t, i) => {
            const exec = execution.tests[i];
            return {
              ...t,
              passed: exec?.passed ?? null,
            };
          });
          setTestResults(updated);
        }

        setExecutionData(execution);

        if (visualization) {
          setVisualizationData(visualization);
          setCurrentVisStep(0);
        } else if (visualize) {
          setOutput("No visualization data generated.");
        }

        if (analysis) {
          // Auto-analysis disabled on Run
        }
      } catch (err: any) {
        console.error("Error invoking debug-code:", err);
        setOutput(`Error invoking debug-code: ${err?.message || String(err)}`);
        toast.error("Failed to invoke debug code function");
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(currentProblem.starterCode[language]);
    setOutput(null);
    setTestResults(testCases.map(tc => ({ ...tc, passed: null })));
    setVisualizationData(null);
  };

  const handleSendMessage = async (text?: string) => {
    const content = text || inputValue;
    if (!content.trim()) return;

    // Add user message immediately
    const userMsg = { role: "user" as const, content };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsAiLoading(true);

    try {
      const testsPayload = testResults.map((t) => ({ input: t.input, expected: t.expected }));

      // Dynamically import the Supabase client
      let supabase: any;
      try {
        const mod = await import("@/integrations/supabase/client");
        supabase = (mod as any).supabase;
      } catch (err) {
        setMessages(prev => [...prev, { role: "assistant", content: "Error: Supabase client not available." }]);
        return;
      }

      const { data, error } = await supabase.functions.invoke("debug-code", {
        body: {
          code,
          language,
          tests: testsPayload,
          skipAnalysis: false,
          executionResults: executionData,
          userQuestion: content
        },
      });

      if (error) {
        setMessages(prev => [...prev, { role: "assistant", content: `Error: ${error.message}` }]);
        return;
      }

      if (data?.analysis) {
        setMessages(prev => [...prev, { role: "assistant", content: data.analysis }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "AI could not analyze the code." }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${err?.message}` }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  const toggleHint = (index: number) => {
    setShowHints(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="h-full bg-background">
      <ResizablePanelGroup direction="horizontal" className="min-h-[200px] border rounded-lg">

        {/* Left Panel: Problem Description */}
        <ResizablePanel defaultSize={25} minSize={20} className="border-r border-border">
          <div className="flex bg-muted/40 h-10 items-center justify-between px-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold text-sm">{currentProblem.title}</span>
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="h-[calc(100%-40px)] flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4">
              <TabsTrigger value="problem" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Description
              </TabsTrigger>
              <TabsTrigger value="hints" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Hints
              </TabsTrigger>
            </TabsList>
            <TabsContent value="problem" className="flex-1 overflow-auto p-4 mt-0">
              <div className="prose prose-invert max-w-none text-sm">
                <div className="whitespace-pre-wrap text-foreground">{currentProblem.description}</div>

                <h3 className="mt-6 text-md font-semibold">Examples</h3>
                {currentProblem.examples.map((example, i) => (
                  <div key={i} className="mt-4 rounded-lg bg-muted/50 p-4 font-mono text-xs">
                    <div><span className="text-muted-foreground">Input:</span> {example.input}</div>
                    <div><span className="text-muted-foreground">Output:</span> {example.output}</div>
                    {example.explanation && (
                      <div className="mt-2 text-muted-foreground">{example.explanation}</div>
                    )}
                  </div>
                ))}

                <h3 className="mt-6 text-md font-semibold">Constraints</h3>
                <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground">
                  {currentProblem.constraints.map((constraint, i) => (
                    <li key={i} className="font-mono">{constraint}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="hints" className="flex-1 overflow-auto p-4 mt-0">
              {currentProblem.hints.map((hint, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4 mb-3">
                  <button
                    onClick={() => toggleHint(i)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <span className="font-medium text-sm">Hint {i + 1}</span>
                    <Lightbulb className={cn(
                      "h-4 w-4 transition-colors",
                      showHints.includes(i) ? "text-warning" : "text-muted-foreground"
                    )} />
                  </button>
                  {showHints.includes(i) && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-2 text-xs text-muted-foreground"
                    >
                      {hint}
                    </motion.p>
                  )}
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </ResizablePanel>

        <ResizableHandle />

        {/* Middle Panel: Editor & Output */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={60} minSize={30}>
              <div className="flex h-full flex-col">
                {/* Editor Header */}
                <div className="flex items-center justify-between border-b border-border bg-muted/40 p-2 h-10">
                  <div className="flex items-center gap-2">
                    {(["python", "javascript", "cpp"] as Language[]).map((lang) => (
                      <Button
                        key={lang}
                        variant={language === lang ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => handleLanguageChange(lang)}
                        className="text-xs h-7 px-2"
                      >
                        {lang === "cpp" ? "C++" : lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => handleRun(true)} disabled={isRunning} variant="outline" className="h-7 text-xs">
                      <Eye className="mr-1 h-3 w-3" />
                      Visualize
                    </Button>
                    <Button size="sm" onClick={() => handleRun(false)} disabled={isRunning} className="h-7 text-xs">
                      {isRunning ? <Clock className="mr-1 h-3 w-3 animate-spin" /> : <Play className="mr-1 h-3 w-3" />}
                      Run
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <Editor
                    height="100%"
                    language={language === "cpp" ? "cpp" : language}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      fontFamily: "'JetBrains Mono', monospace",
                      minimap: { enabled: false },
                      padding: { top: 16 },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: "on",
                    }}
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={40} minSize={10}>
              <Tabs value={activeOutputTab} onValueChange={(v) => setActiveOutputTab(v as "execution" | "visualization")} className="flex flex-col h-full bg-muted/20">
                <div className="flex items-center justify-between border-b border-border px-4 bg-muted/40 h-8">
                  <TabsList className="h-full bg-transparent p-0">
                    <TabsTrigger value="execution" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 text-xs">execution</TabsTrigger>
                    <TabsTrigger value="visualization" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 text-xs">Visualization</TabsTrigger>
                  </TabsList>
                  {activeOutputTab === "execution" && (
                    <div className="flex gap-1">
                      {testResults.map((tc, i) => (
                        <div key={i} className={cn(
                          "w-2 h-2 rounded-full",
                          tc.passed === true ? "bg-green-500" : tc.passed === false ? "bg-red-500" : "bg-gray-500"
                        )} />
                      ))}
                    </div>
                  )}
                </div>

                <TabsContent value="execution" className="flex-1 overflow-auto p-4 font-mono text-xs mt-0">
                  {executionData ? (
                    <div className="space-y-4">
                      {executionData.error ? (
                        <div className="rounded-md bg-destructive/10 p-3 text-destructive border border-destructive/20">
                          <div className="font-semibold mb-1">Execution Error</div>
                          <div>{executionData.error}</div>
                          {executionData.details && <div className="mt-1 opacity-75">{executionData.details}</div>}
                        </div>
                      ) : (
                        executionData.tests?.map((test: any, i: number) => (
                          <div key={i} className="rounded border border-border bg-card overflow-hidden">
                            <div className={cn(
                              "flex items-center justify-between px-3 py-2 border-b border-border/50",
                              test.passed ? "bg-green-500/10" : "bg-red-500/10"
                            )}>
                              <span className="font-medium">Test Case {i + 1}</span>
                              <Badge variant={test.passed ? "default" : "destructive"} className={cn(test.passed && "bg-green-600 hover:bg-green-700")}>
                                {test.passed ? "Passed" : "Failed"}
                              </Badge>
                            </div>
                            <div className="p-3 grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-muted-foreground mb-1">Input</div>
                                <div className="bg-muted p-2 rounded">{test.input}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-1">Expected</div>
                                <div className="bg-muted p-2 rounded">{test.expected}</div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-muted-foreground mb-1">Actual Output</div>
                                <div className={cn("p-2 rounded font-semibold", test.passed ? "bg-muted" : "bg-red-500/10 text-red-400")}>
                                  {test.stdout !== null ? test.stdout.trim() : <span className="italic opacity-50">No output (stdout is empty)</span>}
                                </div>
                                {test.stderr && (
                                  <div className="mt-2 text-destructive bg-destructive/10 p-2 rounded">
                                    {test.stderr}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : output ? (
                    <pre className="whitespace-pre-wrap">{output}</pre>
                  ) : (
                    <span className="text-muted-foreground">Run your code to see results...</span>
                  )}
                </TabsContent>
                <TabsContent value="visualization" className="flex-1 overflow-hidden p-0 mt-0">
                  {visualizationData ? (
                    visualizationData.type === 'algorithm' ? (
                      <div className="flex flex-col h-full">
                        <div className="flex-1 relative">
                          <VisualCanvas
                            algorithm={visualizationData.algorithm}
                            steps={visualizationData.steps}
                            currentStep={currentVisStep}
                          />
                        </div>
                        <div className="h-10 border-t border-border flex items-center justify-between px-4 bg-muted/40">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setCurrentVisStep(Math.max(0, currentVisStep - 1))}
                            disabled={currentVisStep === 0}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-xs font-mono">
                            Step {currentVisStep + 1} / {visualizationData.steps.length}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setCurrentVisStep(Math.min(visualizationData.steps.length - 1, currentVisStep + 1))}
                            disabled={currentVisStep === visualizationData.steps.length - 1}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        {visualizationData.steps[currentVisStep]?.description && (
                          <div className="p-2 border-t border-border text-xs text-center bg-muted/20">
                            {visualizationData.steps[currentVisStep].description}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 text-muted-foreground">Unsupported visualization type.</div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                      <Sparkles className="h-8 w-8 mb-2 opacity-50" />
                      <p>Click "Visualize" to see code execution.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Panel: AI Chat */}
        <ResizablePanel defaultSize={25} minSize={20} className="border-l border-border bg-card flex flex-col">
          <div className="flex items-center justify-between border-b border-border p-3 h-10 bg-muted/40">
            <div className="flex items-center">
              <Sparkles className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-semibold">Leet Assistant</span>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={clearChat} title="Clear Chat">
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4 opacity-50">
                <Bot className="h-12 w-12 mb-4" />
                <p className="font-medium mb-1">Stuck?</p>
                <p className="text-xs">Leet guides you through every line.</p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={() => handleSendMessage("Analyze my code and explain any bugs.")}>
                  Quick Debug
                </Button>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={cn(
                  "flex flex-col max-w-[90%]",
                  msg.role === "user" ? "self-end items-end" : "self-start items-start"
                )}>
                  <div className={cn(
                    "rounded-lg px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground prose prose-invert prose-sm max-w-none prose-headings:text-primary prose-headings:font-semibold prose-p:text-muted-foreground"
                  )}>
                    {msg.role === "assistant" ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))
            )}
            {isAiLoading && (
              <div className="self-start items-start max-w-[90%]">
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-border bg-background/50">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  className="w-full bg-muted/50 border border-input rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Ask a question..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  disabled={isAiLoading}
                />
                <Button
                  size="icon-sm"
                  className="absolute right-1 top-1 h-7 w-7"
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isAiLoading}
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground text-center mt-2 opacity-50">
              AI can make mistakes. Check important info.
            </div>
          </div>
        </ResizablePanel>

      </ResizablePanelGroup>
    </div>
  );
}
