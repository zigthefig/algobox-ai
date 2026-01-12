import { useState } from "react";
import { Bot, Send, Lightbulb, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface SqlMentorProps {
    query: string;
    onSuggestion?: (suggestion: string) => void;
}

interface Message {
    role: "user" | "mentor";
    content: string;
}

const SOCRATIC_PROMPTS = [
    "Before I help, can you explain what you're trying to achieve with this query?",
    "What tables do you think need to be joined here?",
    "Which rows do you expect to be filtered out by your WHERE clause?",
    "What's the difference between using a subquery vs a JOIN in this case?",
    "Can you identify any potential performance issues?",
];

export function SqlMentor({ query, onSuggestion }: SqlMentorProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(true);

    const askMentor = async (question: string) => {
        if (!question.trim()) return;

        setMessages((prev) => [...prev, { role: "user", content: question }]);
        setInput("");
        setIsLoading(true);
        setShowQuickActions(false);

        try {
            const { data, error } = await supabase.functions.invoke("debug-code", {
                body: {
                    code: query,
                    language: "sql",
                    userQuestion: question,
                    skipAnalysis: false,
                    context: "sql-mentor",
                    systemPrompt: `You are a SQL mentor following the Socratic method. 
            NEVER give direct answers. 
            Instead, ask guiding questions to help the user understand.
            If they ask about optimization, ask them what they think the current bottleneck is.
            If they ask about syntax, ask them to explain what each part does.
            Keep responses concise (2-3 sentences max).
            End with a thought-provoking question.`,
                },
            });

            const response = data?.analysis || data?.message ||
                "Let me ask you this: What output do you expect from this query, and why?";

            setMessages((prev) => [...prev, { role: "mentor", content: response }]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: "mentor", content: "I'm having trouble connecting. Try asking again!" },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = [
        { label: "Explain my query", action: () => askMentor("Can you help me understand my query?") },
        { label: "Check for issues", action: () => askMentor("Are there any problems with my query?") },
        { label: "Optimize this", action: () => askMentor("How can I make this query faster?") },
    ];

    return (
        <div className="h-full flex flex-col bg-slate-900/50 rounded-lg border border-slate-700">
            {/* Header */}
            <div className="p-3 border-b border-slate-700 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-200">SQL Mentor</h3>
                    <p className="text-xs text-slate-500">I'll guide, not give answers</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-3 space-y-3">
                {messages.length === 0 && showQuickActions && (
                    <div className="space-y-3">
                        <div className="text-center py-6">
                            <Lightbulb className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-400">
                                I won't give you answers directly.
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                I'll ask questions to help you think through the problem.
                            </p>
                        </div>
                        <div className="space-y-2">
                            {quickActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={action.action}
                                    disabled={!query}
                                    className={cn(
                                        "w-full p-2 text-left text-sm rounded-lg transition-colors",
                                        query
                                            ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                                            : "bg-slate-800/50 text-slate-500 cursor-not-allowed"
                                    )}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "p-3 rounded-lg text-sm",
                            msg.role === "user"
                                ? "bg-blue-600 text-white ml-8"
                                : "bg-slate-800 text-slate-300 mr-8"
                        )}
                    >
                        {msg.content}
                    </div>
                ))}

                {isLoading && (
                    <div className="bg-slate-800 text-slate-400 p-3 rounded-lg mr-8 text-sm">
                        <span className="animate-pulse">Thinking...</span>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-700">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        askMentor(input);
                    }}
                    className="flex gap-2"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your query..."
                        className="flex-1 bg-slate-800 border-slate-600 text-slate-200"
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
