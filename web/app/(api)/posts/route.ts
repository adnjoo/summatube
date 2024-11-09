import { NextResponse } from 'next/server';

const posts = [
  {
    id: 1,
    title: 'First Blog Post',
    content: 'This is the content of the first blog post.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Second Blog Post',
    content: 'This is the content of the second blog post.',
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json(posts);
}
