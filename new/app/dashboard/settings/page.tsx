import Settings from "@/components/settings/Settings";
import { getSubscription } from "@/lib/db/dbCalls";
import { auth } from "@clerk/nextjs/server";

export default async function SettingsPage() {
    const userId = await auth()
    const data = await getSubscription(userId)
    return (
        <div>
            <Settings subscription={data} />
        </div>
    );
}