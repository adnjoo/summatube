import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import getPosts, { Post } from '@/lib/get-posts';

export default async function Blog() {
  const posts: Post[] = await getPosts();

  return (
    <div className='container mx-auto max-w-xl px-4 py-16'>
      <h1 className='mb-8 text-center text-4xl font-bold'>Blog</h1>
      <div className='space-y-8'>
        {posts.map((post) => {
          const link = `/blog/${post.slug}`;
          return (
            <Card key={post.slug} className='transition-shadow hover:shadow-lg'>
              <CardHeader>
                {post.image && (
                  <Link
                    className='relative overflow-hidden rounded-t-md'
                    href={link}
                  >
                    <img
                      src={post.image}
                      alt={`${post.title} image`}
                      className='h-48 w-full object-cover transition-transform duration-300 hover:scale-105'
                    />
                  </Link>
                )}
                <CardTitle>
                  <Link
                    href={link}
                    className='hover:underline'
                  >
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className='text-gray-600'>
                  {post.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-gray-700'>{post.description}</p>
                <Button asChild className='mt-4'>
                  <Link href={link}>Read more</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
