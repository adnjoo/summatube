import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PostBody } from '@/components/mdx/post-body';
import { Button } from '@/components/ui/button';
import { getPost } from '@/lib/get-posts';
import { AppConfig } from '@/lib/constants';

type BlogPostPageParams = Promise<{
  slug: string;
}>;

export default async function BlogPostPage(props: {
  params: BlogPostPageParams;
}) {
  const params = await props.params;
  const post = await getPost(params.slug);
  if (!post) return notFound();

  return (
    <section className='container mx-auto px-4 py-16 flex flex-col'>
      {post.image && (
        <div className='relative mb-8 h-64 w-full overflow-hidden rounded-md'>
          <img
            src={post.image}
            alt={`${post.title} image`}
            className='h-full w-full object-cover'
          />
          <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50'>
            <h1 className='text-3xl font-bold text-white'>{post.title}</h1>
          </div>
        </div>
      )}
      <p>{post.date}</p>
      <PostBody>{post.body}</PostBody>

      <Link href={AppConfig.SITE_MAP.BLOG} className='hover:underline pt-12'>Back to blog</Link>
    </section>
  );
}
