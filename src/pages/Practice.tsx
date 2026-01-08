import { useState } from "react";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState(currentProblem.starterCode[language]);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"problem" | "hints" | "ai">("problem");
  const [showHints, setShowHints] = useState<number[]>([]);
  const [testResults, setTestResults] = useState(testCases);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setCode(currentProblem.starterCode[newLang]);
  };

  const handleRun = () => {
    setIsRunning(true);
    setOutput(null);
    
    // Simulate code execution
    setTimeout(() => {
      setIsRunning(false);
      setOutput("Running tests...\n\nTest 1: Passed ✓\nTest 2: Passed ✓\nTest 3: Passed ✓\n\nAll tests passed!");
      setTestResults(testCases.map(tc => ({ ...tc, passed: true })));
    }, 1500);
  };

  const handleReset = () => {
    setCode(currentProblem.starterCode[language]);
    setOutput(null);
    setTestResults(testCases.map(tc => ({ ...tc, passed: null })));
  };

  const handleAskAI = () => {
    setAiResponse("Analyzing your code...\n\n🔍 **Issue Found:**\nYour current approach uses a nested loop which results in O(n²) time complexity.\n\n💡 **Suggestion:**\nUse a hash map to store indices. For each element, check if `target - element` exists in the map.\n\n```python\ndef twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n```\n\nThis reduces time complexity to O(n).");
  };

  const toggleHint = (index: number) => {
    setShowHints(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Problem Description */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex w-[45%] flex-col border-r border-border"
      >
        {/* Problem Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-semibold">{currentProblem.title}</h1>
              <div className="flex items-center gap-2">
                <Badge variant={currentProblem.difficulty}>{currentProblem.difficulty}</Badge>
                {currentProblem.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="icon-sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4">
            <TabsTrigger value="problem" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Problem
            </TabsTrigger>
            <TabsTrigger value="hints" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Lightbulb className="mr-1 h-4 w-4" />
              Hints
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Sparkles className="mr-1 h-4 w-4" />
              AI Help
            </TabsTrigger>
          </TabsList>

          <TabsContent value="problem" className="flex-1 overflow-auto p-4 mt-0">
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-foreground">{currentProblem.description}</div>
              
              <h3 className="mt-6 text-lg font-semibold">Examples</h3>
              {currentProblem.examples.map((example, i) => (
                <div key={i} className="mt-4 rounded-lg bg-muted/50 p-4 font-mono text-sm">
                  <div><span className="text-muted-foreground">Input:</span> {example.input}</div>
                  <div><span className="text-muted-foreground">Output:</span> {example.output}</div>
                  {example.explanation && (
                    <div className="mt-2 text-muted-foreground">{example.explanation}</div>
                  )}
                </div>
              ))}

              <h3 className="mt-6 text-lg font-semibold">Constraints</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                {currentProblem.constraints.map((constraint, i) => (
                  <li key={i} className="font-mono">{constraint}</li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="hints" className="flex-1 overflow-auto p-4 mt-0">
            <div className="space-y-3">
              {currentProblem.hints.map((hint, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4">
                  <button
                    onClick={() => toggleHint(i)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <span className="font-medium">Hint {i + 1}</span>
                    <Lightbulb className={cn(
                      "h-4 w-4 transition-colors",
                      showHints.includes(i) ? "text-warning" : "text-muted-foreground"
                    )} />
                  </button>
                  {showHints.includes(i) && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-2 text-sm text-muted-foreground"
                    >
                      {hint}
                    </motion.p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ai" className="flex-1 overflow-auto p-4 mt-0">
            <div className="space-y-4">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-medium">AI Debugging Assistant</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get personalized help with your code. The AI will analyze your solution and provide targeted feedback.
                </p>
                <Button className="mt-4" onClick={handleAskAI}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Explain My Mistake
                </Button>
              </div>

              {aiResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="prose prose-invert max-w-none text-sm whitespace-pre-wrap">
                    {aiResponse}
                  </div>
                </motion.div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Right Panel - Code Editor */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-1 flex-col"
      >
        {/* Editor Header */}
        <div className="flex items-center justify-between border-b border-border p-2">
          <div className="flex items-center gap-2">
            {(["python", "javascript", "cpp"] as Language[]).map((lang) => (
              <Button
                key={lang}
                variant={language === lang ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleLanguageChange(lang)}
                className="text-xs"
              >
                {lang === "cpp" ? "C++" : lang.charAt(0).toUpperCase() + lang.slice(1)}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1">
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

        {/* Test Cases & Output */}
        <div className="border-t border-border">
          <div className="flex items-center justify-between border-b border-border p-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Test Cases</span>
              <div className="flex items-center gap-2">
                {testResults.map((tc, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded text-xs font-medium",
                      tc.passed === true && "bg-success/20 text-success",
                      tc.passed === false && "bg-destructive/20 text-destructive",
                      tc.passed === null && "bg-muted text-muted-foreground"
                    )}
                  >
                    {tc.passed === true ? <CheckCircle2 className="h-4 w-4" /> :
                     tc.passed === false ? <XCircle className="h-4 w-4" /> :
                     i + 1}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="mr-1 h-4 w-4" />
                Reset
              </Button>
              <Button size="sm" onClick={handleRun} disabled={isRunning}>
                {isRunning ? (
                  <>
                    <Clock className="mr-1 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="mr-1 h-4 w-4" />
                    Run Code
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Output */}
          <div className="h-32 overflow-auto bg-code-bg p-4">
            {output ? (
              <pre className="font-mono text-sm text-foreground">{output}</pre>
            ) : (
              <p className="text-sm text-muted-foreground">
                Click "Run Code" to see output...
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
