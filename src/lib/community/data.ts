export interface Answer {
    id: string;
    content: string;
    author: {
        name: string;
        avatar?: string;
        isAi?: boolean;
    };
    likes: number;
    createdAt: string;
}

export interface Question {
    id: string;
    title: string;
    content: string;
    tags: string[];
    author: {
        name: string;
        avatar?: string;
    };
    views: number;
    likes: number;
    answers: Answer[];
    createdAt: string;
}

export const MOCK_QUESTIONS: Question[] = [
    {
        id: "1",
        title: "How do I optimize Two Pointers for 3Sum?",
        content: "I'm struggling with the 3Sum problem constraints. My O(n^2) solution times out on large test cases. Any specialized tips for skipping duplicates effectively?",
        tags: ["algorithms", "two-pointers", "optimization"],
        author: {
            name: "Alex Dev",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        },
        views: 124,
        likes: 12,
        createdAt: "2024-03-15T10:30:00Z",
        answers: [
            {
                id: "a1",
                content: "Make sure you sort the array first! Then, when iterating, check if `nums[i] == nums[i-1]` to skip duplicates for the first number. Do the same for the pointers inside the loop.",
                author: {
                    name: "Sarah Code",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
                },
                likes: 5,
                createdAt: "2024-03-15T11:00:00Z",
            },
        ],
    },
    {
        id: "2",
        title: "Difference between DP and Greedy?",
        content: "Can someone explain when to strictly use Dynamic Programming vs Greedy? I often get confused and try Greedy when DP is needed.",
        tags: ["dynamic-programming", "greedy", "theory"],
        author: {
            name: "Jordan Lee",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
        },
        views: 89,
        likes: 8,
        createdAt: "2024-03-14T15:20:00Z",
        answers: [],
    },
    {
        id: "3",
        title: "Help with Binary Tree Level Order Traversal",
        content: "My BFS queue implementation seems to be adding null nodes. Here is my code...",
        tags: ["trees", "bfs", "debugging"],
        author: {
            name: "Casey Smith",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Casey",
        },
        views: 205,
        likes: 15,
        createdAt: "2024-03-10T09:15:00Z",
        answers: [
            {
                id: "a2",
                content: "You should check if `node.left` and `node.right` are not null before pushing them to the queue.",
                author: {
                    name: "Algobox AI",
                    isAi: true
                },
                likes: 42,
                createdAt: "2024-03-10T09:16:00Z",
            }
        ],
    },
];
