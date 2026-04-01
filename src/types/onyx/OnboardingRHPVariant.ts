/**
 * The variant of the onboarding RHP for A/B/C testing
 * @description 'control' - The variant with the Concierge DM
 * @description 'rhpConciergeDm' - Admin of workspace with Concierge DM
 * @description 'rhpAdminsRoom' - Admin of workspace with the admins room
 * @description 'trackExpensesWithConcierge' - Track workspace admins land on Home page with Concierge side panel (desktop) or Concierge chat (mobile)
 */
type OnboardingRHPVariant = 'rhpConciergeDm' | 'rhpAdminsRoom' | 'trackExpensesWithConcierge' | 'control';

export default OnboardingRHPVariant;
