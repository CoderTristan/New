"use client";

import { redirectToCustomerPortal } from "@/app/actions/subscription.actions";
import { useTransition } from "react";

export function ManageSubscriptionButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={() => {
        startTransition(() => redirectToCustomerPortal());
      }}
    >
      <button
        type="submit"
        disabled={isPending}
        className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50 w-full"
      >
        {isPending ? "Loading..." : "Manage Subscription"}
      </button>
    </form>
  );
}
