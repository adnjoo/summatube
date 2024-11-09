'use client';

import { useEffect, useState } from 'react';

import { Card } from '@/components/ui/card';
import { AppConfig } from '@/lib/constants';

type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
};

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/posts'); // Adjust the API endpoint as needed
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='my-container mx-auto max-w-4xl p-4 sm:pt-12'>
      <h1 className='mb-6 text-3xl font-bold'>Blog</h1>
      {posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className='mb-4 p-4 shadow'>
            <h2 className='text-xl font-semibold'>{post.title}</h2>
            <p className='text-sm text-gray-500'>
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
            <p className='mt-2'>{post.content}</p>
          </Card>
        ))
      )}
    </div>
  );
}
