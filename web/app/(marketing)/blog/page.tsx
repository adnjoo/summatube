import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import getPosts, { Post } from '@/lib/get-posts';

export default async function Blog() {
  const posts: Post[] = await getPosts();
  
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-center text-4xl font-bold">Blog</h1>
      <div className="space-y-8">
        {posts.map((post) => (
          <Card key={post.slug} className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle>
                <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:text-blue-800">
                  {post.title}
                </Link>
              </CardTitle>
              <CardDescription className="text-gray-600">{post.date}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{post.description}</p>
              <Button asChild className="mt-4">
                <Link href={`/blog/${post.slug}`}>Read more</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
