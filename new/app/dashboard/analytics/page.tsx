import Analytics from "@/components/analytics/Analytics";
import { getSubscription } from "@/lib/db/dbCalls";
import { auth } from "@clerk/nextjs/server";

export default async function AnalyticsPage() {
    
      const userId = await auth()
      const data = await getSubscription(userId)
    return (
        <div>
<Analytics subscription={data} />
        </div>
    );
}