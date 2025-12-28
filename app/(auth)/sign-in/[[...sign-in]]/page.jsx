import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function Page() {
  return <SignIn appearance={clerkAppearance} />;
}
