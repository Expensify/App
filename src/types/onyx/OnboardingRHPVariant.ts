/**
 * The variant of the onboarding RHP for A/B/C/D testing
 * @description 'control' - The variant with the Concierge DM
 * @description 'rhpConciergeDm' - Admin of workspace with Concierge DM
 * @description 'rhpAdminsRoom' - Admin of workspace with the admins room
 * @description 'rhpHomePage' - Navigate to Home page with Concierge Anywhere accessible in #admins room
 * @description 'trackExpensesWithConcierge' - Track workspace admins land on Home page with Concierge side panel (desktop) or Concierge chat (mobile)
 */
type OnboardingRHPVariant = 'rhpConciergeDm' | 'rhpAdminsRoom' | 'rhpHomePage' | 'trackExpensesWithConcierge' | 'control';

export default OnboardingRHPVariant;
