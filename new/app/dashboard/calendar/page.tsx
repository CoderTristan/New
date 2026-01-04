import Calendar from "@/components/calendar/CalendarPart";
import { getSubscription } from "@/lib/db/dbCalls";
import { auth } from "@clerk/nextjs/server";

export default async function CalendarPage() {
    const {userId} = await auth();
    const data = await getSubscription(userId)
    return (
        <div>
            <Calendar subscription={data} />
        </div>
    );
}