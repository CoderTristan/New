import { getUserIdeas } from "@/lib/db/dbCalls";
import IdeaInbox from "@/components/idea/IdeaInbox";

export default async function IdeasPage() {
  // Fetch ideas server-side
  const ideas = await getUserIdeas();

  return (
    <div>
      <IdeaInbox initialIdeas={ideas} />
    </div>
  );
}
