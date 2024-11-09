import Link from 'next/link';

import getPosts, { Post } from '@/lib/get-posts';

export default async function Blog() {
  const posts: Post[] = await getPosts();
  return (
    <div className='container mx-auto px-4 py-16'>
      <h1 className='mb-8 text-center text-4xl font-bold'>Blog</h1>
      <div className='space-y-8'>
        {posts.map((post) => (
          <div
            key={post.slug}
            className='rounded-lg border border-gray-200 p-6 shadow transition-shadow hover:shadow-lg'
          >
            <Link
              href={`/blog/${post.slug}`}
              className='text-2xl font-semibold text-blue-600 hover:text-blue-800'
            >
              {post.title}
            </Link>
            <p className='mt-2 text-gray-700'>{post.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
