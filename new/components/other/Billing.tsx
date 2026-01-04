import { auth } from "@clerk/nextjs/server";
import { getSubscription } from "@/lib/db/dbCalls";
import { PLANS } from "@/lib/plans";
import { CheckoutButton } from "./CheckoutButton";
import { ManageSubscriptionButton } from "./ManageSubs";

export default async function Billing() {
  const { userId } = await auth();
  if (!userId) throw new Error("User not found");

  const data = await getSubscription(userId);
  console.log(data);

  // Ensure data exists and has at least one subscription
  const subscription = data && data.length > 0 ? data[0] : null;
  const currentPlan = subscription
    ? PLANS.find((p) => p.name === subscription.plan_name)
    : null;

  console.log(currentPlan);

  return (
    <div className="mx-auto py-16 px-6 bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">
          Billing & Subscription
        </h1>
        <p className="text-stone-500">
          Manage your subscription and plan details.
        </p>
      </div>

      {/* Current Plan */}
      <div className="mb-10 bg-white border border-stone-200 rounded-xl p-6">
        {currentPlan ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-stone-900">
                Current Plan
              </h2>
              <span className="text-xs font-medium px-2 py-1 rounded-md bg-stone-100 text-stone-700">
                Active
              </span>
            </div>

            <div className="text-3xl font-bold text-stone-900 mb-1">
              ${currentPlan.priceMonthly}
              <span className="text-base font-medium text-stone-500"> / month</span>
            </div>

            <p className="text-sm text-stone-500 mb-4">
              {currentPlan.name} plan
            </p>

            <ManageSubscriptionButton />
          </>
        ) : (
          <p className="text-sm text-stone-600">
            You are currently on the Free plan.
          </p>
        )}
      </div>

      {/* Available Plans */}
      <div className="mb-6">
        <h2 className="font-semibold text-stone-900 mb-4">
          Available Plans
        </h2>

        <div className="grid grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isActive = currentPlan?.id === plan.id;

            return (
              <div
                key={plan.id}
                className={`p-5 rounded-xl border-2 bg-white transition ${
                  isActive
                    ? "border-stone-900 bg-stone-50"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-stone-900">
                    {plan.name}
                  </span>
                  {isActive && (
                    <span className="text-xs text-stone-700 font-medium">
                      Selected
                    </span>
                  )}
                </div>

                <div className="text-2xl font-bold text-stone-900 mb-1">
                  ${plan.priceMonthly}
                  <span className="text-sm font-medium text-stone-500"> /mo</span>
                </div>

                <p className="text-xs text-stone-500 mb-4">
                  {plan.description}
                </p>

                <ul className="space-y-1 mb-5">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="text-sm text-stone-600 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                      {f}
                    </li>
                  ))}
                </ul>

                {plan.stripePriceId ? (
                  <CheckoutButton
                    priceId={plan.stripePriceId}
                    planName={plan.name}
                    disabledButton={isActive}
                    isLoggedIn
                  />
                ) : (
                  <div className="text-xs text-stone-500 text-center">
                    Included for all users
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
