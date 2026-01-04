import ScriptView from "@/components/analytics/ScriptView";
import { getScriptById } from "@/lib/db/dbCalls";


export default async function ScriptSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
    const {id} = await params
  const script = await getScriptById(id);

  
  return (
    <div>
      <ScriptView scriptId={id} />
    </div>
  );
}
