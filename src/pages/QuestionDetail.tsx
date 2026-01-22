import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_QUESTIONS, Question, Answer } from "@/lib/community/data";
import { ArrowLeft, MessageSquare, ThumbsUp, Eye, Send, Bot, User, Share2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import GeneratingLoader from "@/components/ui/GeneratingLoader";
import ReactMarkdown from "react-markdown";

export default function QuestionDetail() {
    const { questionId } = useParams();
    const [question, setQuestion] = useState<Question | null>(null);
    const [newAnswer, setNewAnswer] = useState("");
    const [isAiGenerating, setIsAiGenerating] = useState(false);

    useEffect(() => {
        const q = MOCK_QUESTIONS.find(q => q.id === questionId);
        if (q) setQuestion(q);
    }, [questionId]);

    const generateAiResponse = () => {
        setIsAiGenerating(true);
        // Simulate AI delay
        setTimeout(() => {
            const aiAns: Answer = {
                id: "ai-" + Date.now(),
                content: `Hello! I noticed you tagged me. Here is an analysis of the problem based on the **${question?.tags[0] || 'algorithm'}** pattern:\n\n### Optimization Strategy\nTo improve the time complexity, consider using a **HashMap** to store frequency counts instead of a nested loop.\n\n\`\`\`javascript\nconst map = new Map();\nfor (const num of nums) {\n  map.set(num, (map.get(num) || 0) + 1);\n}\n\`\`\`\n\nHope this helps!`,
                author: { name: "Algobox AI", isAi: true, avatar: "" },
                likes: 0,
                createdAt: new Date().toISOString()
            };
            setQuestion(prev => prev ? ({ ...prev, answers: [...prev.answers, aiAns] }) : null);
            setIsAiGenerating(false);
            toast.success("AI has responded!");
        }, 4000); // 4 seconds to show off the loader
    };

    const handlePostAnswer = () => {
        if (!newAnswer.trim() || !question) return;

        // Check for AI tag
        const isSummoningAi = newAnswer.toLowerCase().includes("@ai");

        const ans: Answer = {
            id: Date.now().toString(),
            content: newAnswer,
            author: { name: "You", avatar: "" },
            likes: 0,
            createdAt: new Date().toISOString()
        };

        setQuestion({ ...question, answers: [...question.answers, ans] });
        setNewAnswer("");
        toast.success("Answer posted!");

        if (isSummoningAi) {
            setTimeout(() => {
                generateAiResponse();
            }, 500);
        }
    };

    if (!question) return (
        <div className="flex h-screen items-center justify-center text-muted-foreground">
            Question not found
        </div>
    );

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 pb-32">
            {/* Header & Back */}
            <div className="flex items-center gap-4">
                <Link to="/community">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <h1 className="text-2xl font-bold flex-1">{question.title}</h1>
            </div>

            {/* Question Body */}
            <div className="border bg-card rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {question.author.name[0]}
                    </div>
                    <div>
                        <div className="text-sm font-semibold">{question.author.name}</div>
                        <div className="text-xs text-muted-foreground">Asked on {new Date(question.createdAt).toLocaleDateString()}</div>
                    </div>
                </div>

                <div className="prose dark:prose-invert max-w-none mb-6 text-foreground">
                    <ReactMarkdown>{question.content}</ReactMarkdown>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex gap-2">
                        {question.tags.map(t => <Badge key={t} variant="outline">#{t}</Badge>)}
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground"><ThumbsUp className="h-4 w-4" /> {question.likes}</Button>
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground"><Share2 className="h-4 w-4" /></Button>
                    </div>
                </div>
            </div>

            {/* AI Call to Action (Manual) */}
            <div className="flex justify-end items-center gap-4">
                <span className="text-sm text-muted-foreground">Tip: Mention <code className="bg-muted px-1 rounded">@AI</code> in your answer to summon help</span>
                <Button
                    onClick={generateAiResponse}
                    disabled={isAiGenerating}
                    className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
                >
                    <Bot className="h-4 w-4" /> Summon AI Answer
                </Button>
            </div>

            {/* Loader Area */}
            {isAiGenerating && (
                <div className="flex items-center justify-center py-8 bg-muted/20 rounded-lg border border-dashed border-amber-500/30">
                    <div className="flex flex-col items-center gap-4">
                        <GeneratingLoader />
                        <p className="text-sm text-muted-foreground animate-pulse">Analyzing discussion context...</p>
                    </div>
                </div>
            )}

            {/* Answers List */}
            <div className="space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    Answers <Badge variant="secondary" className="rounded-full">{question.answers.length}</Badge>
                </h2>
                {question.answers.map(ans => (
                    <div key={ans.id} className={`border rounded-lg p-6 transition-all ${ans.author.isAi ? 'border-amber-500/50 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-card'}`}>
                        {/* Answer Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {ans.author.isAi ? (
                                    <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                                        <Bot className="h-5 w-5 text-amber-500" />
                                    </div>
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-semibold ${ans.author.isAi ? 'text-amber-500' : ''}`}>{ans.author.name}</span>
                                        {ans.author.isAi && <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500 h-5 px-1.5">AI BOT</Badge>}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{new Date(ans.createdAt).toLocaleDateString()} • {new Date(ans.createdAt).toLocaleTimeString()}</div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></Button>
                        </div>

                        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                            <ReactMarkdown
                                components={{
                                    code: ({ node, className, children, ...props }) => {
                                        const match = /language-(\w+)/.exec(className || '')
                                        return match ? (
                                            <div className="bg-slate-950 rounded-md overflow-hidden my-4 border border-slate-800">
                                                <div className="bg-slate-900 px-4 py-1 text-xs text-slate-400 border-b border-slate-800 font-mono">{match[1]}</div>
                                                <pre className="p-4 overflow-x-auto m-0"><code className={`${className} bg-transparent p-0 block`} {...props}>{children}</code></pre>
                                            </div>
                                        ) : (
                                            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>
                                        )
                                    }
                                }}
                            >
                                {ans.content}
                            </ReactMarkdown>
                        </div>

                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
                            <Button variant="ghost" size="sm" className="gap-2 h-8 text-muted-foreground hover:text-foreground">
                                <ThumbsUp className="h-3.5 w-3.5" /> Helpful ({ans.likes})
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* New Answer Input */}
            <div className="space-y-4 pt-8 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-10 p-4 -mx-4 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] rounded-t-xl border-x border-t">
                <h3 className="font-semibold text-sm">Post your answer</h3>
                <div className="relative">
                    <Textarea
                        placeholder="Type your solution here... (Tip: Tag @AI for rapid help)"
                        rows={3}
                        className="resize-none pr-24"
                        value={newAnswer}
                        onChange={e => setNewAnswer(e.target.value)}
                    />
                    <Button
                        onClick={handlePostAnswer}
                        className="absolute right-2 bottom-2"
                        size="sm"
                        disabled={!newAnswer.trim()}
                    >
                        <Send className="h-3.5 w-3.5 mr-2" /> Post
                    </Button>
                </div>
            </div>
        </div>
    );
}
