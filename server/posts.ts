import { v4 as uuidv4 } from 'uuid';

export interface Post {
    id: string;
    content: string;
    author: string;
    timestamp: number;
}

export class PostManager {
    private posts: Map<string, Post> = new Map();

    create(content: string, author: string): Post {
        const id = uuidv4();
        const post: Post = {
            id,
            content,
            author,
            timestamp: Date.now()
        };
        this.posts.set(id, post);
        return post;
    }

    getAll(): Post[] {
        return Array.from(this.posts.values()).sort((a, b) => b.timestamp - a.timestamp);
    }

    update(id: string, content: string): Post | null {
        const post = this.posts.get(id);
        if (!post) return null;

        post.content = content;
        this.posts.set(id, post); // Update reference if needed (JS objects are ref, but good practice)
        return post;
    }

    delete(id: string): boolean {
        return this.posts.delete(id);
    }
}

export const postManager = new PostManager();
