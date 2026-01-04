import ScriptWorkspace from "@/components/scripts/ScriptWorkplace";
import { getScriptById, getSubscription } from "@/lib/db/dbCalls";
import { auth } from "@clerk/nextjs/server";


export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await auth()
    const {id} = await params
  const script = await getScriptById(id);
  const data = await getSubscription(userId)


  return (
    <div>
      <ScriptWorkspace initialScript={script} scriptId={id} subscription={data}/>
    </div>
  );
}
