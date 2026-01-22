import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, ThumbsUp, Eye, Search, Plus } from "lucide-react";
import { MOCK_QUESTIONS, Question } from "@/lib/community/data";

export default function Community() {
    const [search, setSearch] = useState("");
    const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);

    const filtered = questions.filter(q => q.title.toLowerCase().includes(search.toLowerCase()) || q.tags.some(t => t.includes(search.toLowerCase())));

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Community Forum</h1>
                    <p className="text-muted-foreground">Discuss algorithms, share patterns, and get help from AI</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Ask Question
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search questions or tags..."
                    className="pl-10 h-11"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="space-y-4">
                {filtered.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No discussions found. Be the first to ask!
                    </div>
                ) : filtered.map(q => (
                    <Link to={`/community/${q.id}`} key={q.id} className="block group">
                        <Card className="hover:border-primary/50 transition-all cursor-pointer group-hover:shadow-md">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-4">
                                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                                        {q.title}
                                    </CardTitle>
                                    <div className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-2">
                                        <span>{q.author.name}</span>
                                        <span>•</span>
                                        {new Date(q.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                                    {q.content}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2 flex-wrap">
                                        {q.tags.map(t => (
                                            <Badge key={t} variant="secondary" className="text-xs font-normal">
                                                #{t}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <ThumbsUp className="h-4 w-4" /> {q.likes}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MessageSquare className="h-4 w-4" /> {q.answers.length}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Eye className="h-4 w-4" /> {q.views}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
