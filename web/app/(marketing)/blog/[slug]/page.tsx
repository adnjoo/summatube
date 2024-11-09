import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PostBody } from '@/components/mdx/post-body';
import { Button } from '@/components/ui/button';
import { getPost } from '@/lib/get-posts';

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const post = await getPost(slug);
  if (!post) return notFound();

  return (
    <section className='container mx-auto px-4 py-16'>
      <p>{post.date}</p>
      <PostBody>{post.body}</PostBody>
      <Button asChild variant='link' className='mt-12'>
        <Link href='/blog'>Back to blog</Link>
      </Button>
    </section>
  );
}
