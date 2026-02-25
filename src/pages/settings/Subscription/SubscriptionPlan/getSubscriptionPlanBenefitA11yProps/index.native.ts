import type {GetSubscriptionPlanBenefitA11yProps} from './types';

const getSubscriptionPlanBenefitA11yProps: GetSubscriptionPlanBenefitA11yProps = (params) => ({
    accessible: true,
    accessibilityLabel: `${params?.benefitText}, ${(params?.index ?? 0) + 1} ${params?.ofLabel} ${params?.totalBenefits}`,
});

export default getSubscriptionPlanBenefitA11yProps;
