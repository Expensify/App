type GetSubscriptionPlanBenefitA11yPropsParams = {
    benefitText: string;
    index: number;
    totalBenefits: number;
    ofLabel: string;
};

type SubscriptionPlanBenefitA11yProps = {
    accessible?: boolean;
    accessibilityLabel?: string;
};

type GetSubscriptionPlanBenefitA11yProps = (params?: GetSubscriptionPlanBenefitA11yPropsParams) => SubscriptionPlanBenefitA11yProps;

export type {GetSubscriptionPlanBenefitA11yPropsParams, SubscriptionPlanBenefitA11yProps, GetSubscriptionPlanBenefitA11yProps};
