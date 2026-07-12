import { redirect } from "next/navigation";

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ run?: string }>;
}) {
  const params = await searchParams;
  const query = params.run === "1" ? "?run=1" : "";
  redirect(`/dashboard${query}`);
}
