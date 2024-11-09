import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PostBody } from '@/components/mdx/post-body';
import { getPost } from '@/lib/get-posts';

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params; // Await `params` here if it is asynchronous

  const post = await getPost(slug);
  if (!post) return notFound();

  return (
    <section className='flex flex-col'>
      <PostBody>{post?.body}</PostBody>
      <Link className='mt-12' href='/blog'>
        Back to blog
      </Link>
    </section>
  );
}
