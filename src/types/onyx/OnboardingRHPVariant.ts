/**
 * The variant of the onboarding RHP for A/B/C testing
 * @description 'control' - The variant with the Concierge DM
 * @description 'rhpConciergeDm' - Admin of workspace with Concierge DM
 * @description 'rhpAdminsRoom' - Admin of workspace with the admins room
 */
type OnboardingRHPVariant = 'rhpConciergeDm' | 'rhpAdminsRoom' | 'control';

export default OnboardingRHPVariant;
