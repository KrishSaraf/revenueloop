import { GeneratedSitePage } from "@/components/sites/generated-site-page";

export default async function SitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <GeneratedSitePage slug={slug} />;
}
