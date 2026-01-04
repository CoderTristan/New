import Teleprompter from "@/components/prompter/Tele";
import { getScriptById } from "@/lib/db/dbCalls";


export default async function TeleprompterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
    const {id} = await params
  const script = await getScriptById(id);

  
  return (
    <div>
      <Teleprompter scriptReal={script} scriptId={id} />
    </div>
  );
}
