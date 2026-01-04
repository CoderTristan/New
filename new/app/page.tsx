import LandingPage from "@/components/other/Landing";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/dist/client/components/navigation";

export default async function Home() {
const{ userId} = await auth();
  if (userId) {
    redirect('/dashboard/dashboard');
  } else {

    return (
      <div>
        <LandingPage />
      </div>
    );
  }
}
