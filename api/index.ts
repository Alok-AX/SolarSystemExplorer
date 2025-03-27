import type { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

// Initialize your database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Handle API routes here
        const { method, url } = req;

        if (method === 'GET' && url === '/api/health') {
            return res.status(200).json({ status: 'ok' });
        }

        // Add more route handlers as needed

        return res.status(404).json({ error: 'Not found' });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 