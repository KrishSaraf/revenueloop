import { ProspectWorkspace } from "@/components/prospects/prospect-workspace";

export default async function ProspectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProspectWorkspace id={id} />;
}
