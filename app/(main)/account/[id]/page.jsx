import { redirect } from "next/navigation";

export default async function AccountPage({ params }) {
  const { id } = await params;
  redirect(`/accounts?account=${id}`);
}
