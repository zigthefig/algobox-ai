import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface Note {
    id: string;
    problem_id: string;
    content: string;
    created_at: string;
    updated_at: string;
}

export function useNotes(problemId?: string) {
    const { user } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch notes from localStorage
    useEffect(() => {
        if (!user) {
            setNotes([]);
            setLoading(false);
            return;
        }

        const stored = localStorage.getItem(`notes_${user.id}`);
        let allNotes: Note[] = stored ? JSON.parse(stored) : [];
        
        if (problemId) {
            allNotes = allNotes.filter(n => n.problem_id === problemId);
        }
        
        allNotes.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        setNotes(allNotes);
        setLoading(false);
    }, [user, problemId]);

    const saveNote = async (problemId: string, content: string): Promise<Note | null> => {
        if (!user) return null;

        const stored = localStorage.getItem(`notes_${user.id}`);
        let allNotes: Note[] = stored ? JSON.parse(stored) : [];
        
        const existing = allNotes.find(n => n.problem_id === problemId);
        const now = new Date().toISOString();

        if (existing) {
            existing.content = content;
            existing.updated_at = now;
        } else {
            const newNote: Note = {
                id: crypto.randomUUID(),
                problem_id: problemId,
                content,
                created_at: now,
                updated_at: now
            };
            allNotes.push(newNote);
        }

        localStorage.setItem(`notes_${user.id}`, JSON.stringify(allNotes));
        
        // Update state
        if (problemId) {
            setNotes(allNotes.filter(n => n.problem_id === problemId));
        } else {
            setNotes(allNotes);
        }

        return existing || allNotes[allNotes.length - 1];
    };

    const deleteNote = async (noteId: string) => {
        if (!user) return;

        const stored = localStorage.getItem(`notes_${user.id}`);
        let allNotes: Note[] = stored ? JSON.parse(stored) : [];
        allNotes = allNotes.filter(n => n.id !== noteId);
        
        localStorage.setItem(`notes_${user.id}`, JSON.stringify(allNotes));
        setNotes(prev => prev.filter(n => n.id !== noteId));
    };

    const getNoteForProblem = (problemId: string): Note | null => {
        return notes.find(n => n.problem_id === problemId) || null;
    };

    return { notes, loading, saveNote, deleteNote, getNoteForProblem };
}
