export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    features: ['Pipeline access', 'Idea inbox', 'Script workspace'],
    description: 'Perfect for getting started with essential features.',
    rank: 0,
    stripePriceId: null,
  },
  {
    id: 'creator',
    name: 'Creator',
    priceMonthly: 12,
    features: ['All Free tier features', 'Deliverability scoring', 'Pattern analytics', 'Script comparison', 'Teleprompter', 'Script review', 'Manual Scheduling'],
    description: 'For serious publishers looking to optimize their script performance.',
    rank: 1,
    stripePriceId: 'price_1SgC5qBWrZ7c9WmM3dYU8uUu',
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 29,
    features: ['All Creator tier features', 'Draft limits', 'Friction controls'],
    description: 'Maximum accountability and control.',
    rank: 2,
    stripePriceId: 'price_1SgC8wBWrZ7c9WmMkNYBYQiy',
  },
] as const;

export function getPlanById(id: string) {
  return PLANS.find((plan) => plan.id === id);
}

export const PLANS_RANKED = PLANS.map((plan) => ({
  id: plan.id,
  stripePriceId: plan.stripePriceId,
  rank: plan.rank,
}));
