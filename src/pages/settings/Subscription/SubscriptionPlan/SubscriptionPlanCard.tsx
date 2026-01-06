import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import ActivityIndicator from '@components/ActivityIndicator';
import Icon from '@components/Icon';
import SelectCircle from '@components/SelectCircle';
import Text from '@components/Text';
import useHasTeam2025Pricing from '@hooks/useHasTeam2025Pricing';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePreferredCurrency from '@hooks/usePreferredCurrency';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getSubscriptionPlanInfo, isSubscriptionTypeOfInvoicing} from '@libs/SubscriptionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import SubscriptionPlanCardActionButton from './SubscriptionPlanCardActionButton';

type PersonalPolicyTypeExcludedProps = Exclude<ValueOf<typeof CONST.POLICY.TYPE>, 'personal'>;

type SubscriptionPlanCardProps = {
    /** Subscription plan to display */
    subscriptionPlan: PersonalPolicyTypeExcludedProps | null;

    /** Whether the plan card was rendered inside the comparison modal */
    isFromComparisonModal?: boolean;

    /** Closes comparison modal */
    closeComparisonModal?: () => void;
};

function SubscriptionPlanCard({subscriptionPlan, isFromComparisonModal = false, closeComparisonModal}: SubscriptionPlanCardProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark'] as const);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const currentSubscriptionPlan = useSubscriptionPlan();
    const privateSubscription = usePrivateSubscription();
    const preferredCurrency = usePreferredCurrency();
    const hasTeam2025Pricing = useHasTeam2025Pricing();
    const lazyIllustrations = useMemoizedLazyIllustrations(['Mailbox', 'ShieldYellow']);
    const {title, src, description, benefits, note, subtitle} = getSubscriptionPlanInfo(
        translate,
        subscriptionPlan,
        privateSubscription?.type,
        preferredCurrency,
        isFromComparisonModal,
        hasTeam2025Pricing,
        lazyIllustrations,
    );
    const isSelected = isFromComparisonModal && subscriptionPlan === currentSubscriptionPlan;
    const benefitsColumns = shouldUseNarrowLayout || isFromComparisonModal ? 1 : 2;

    const renderBenefits = () => {
        const amountOfRows = Math.ceil(benefits.length / benefitsColumns);

        return Array.from({length: amountOfRows}).map((_, rowIndex) => (
            <View
                // eslint-disable-next-line react/no-array-index-key
                key={`row-${rowIndex}`}
                style={styles.flexRow}
            >
                {benefits.slice(rowIndex * benefitsColumns, (rowIndex + 1) * benefitsColumns).map((item) => (
                    <View
                        key={item}
                        style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, shouldUseNarrowLayout ? styles.mt3 : styles.mt4]}
                    >
                        <Icon
                            src={icons.Checkmark}
                            fill={theme.iconSuccessFill}
                            width={variables.iconSizeSmall}
                            height={variables.iconSizeSmall}
                        />
                        <Text style={[styles.textLabelSupporting, styles.ml2]}>{item}</Text>
                    </View>
                ))}
            </View>
        ));
    };

    const shouldHideSubscriptionSettingsButton =
        isSubscriptionTypeOfInvoicing(privateSubscription?.type) &&
        !isFromComparisonModal &&
        ((subscriptionPlan === CONST.POLICY.TYPE.TEAM && !hasTeam2025Pricing) || subscriptionPlan !== CONST.POLICY.TYPE.TEAM);

    const subscriptionPlanCardActionButtonWrapStyles = (() => {
        if (shouldHideSubscriptionSettingsButton) {
            return shouldUseNarrowLayout ? [] : styles.pb2;
        }
        if (shouldUseNarrowLayout) {
            return styles.pb5;
        }

        return styles.pb8;
    })();

    return (
        <View style={[styles.borderedContentCard, styles.borderRadiusComponentLarge, styles.mt5, styles.flex1, isSelected && styles.borderColorFocus, styles.justifyContentBetween]}>
            {!privateSubscription ? (
                <View style={shouldUseNarrowLayout ? styles.p5 : [styles.p8, styles.pb6]}>
                    <ActivityIndicator />
                </View>
            ) : (
                <>
                    <View style={shouldUseNarrowLayout ? styles.p5 : [styles.p8, styles.pb6]}>
                        <View style={[styles.flexRow, styles.justifyContentBetween]}>
                            <Icon
                                src={src}
                                width={variables.iconHeader}
                                height={variables.iconHeader}
                            />
                            <View>
                                <SelectCircle
                                    isChecked={isSelected}
                                    selectCircleStyles={[styles.bgTransparent, styles.borderNone]}
                                />
                            </View>
                        </View>
                        <Text style={[styles.headerText, styles.mv2, styles.textHeadlineH2]}>{title}</Text>
                        <Text style={styles.labelStrong}>{subtitle}</Text>
                        <Text style={[styles.textLabelSupporting, styles.textSmall]}>{note}</Text>
                        <Text style={[styles.textLabelSupporting, styles.textNormal, styles.mt3, styles.mb1]}>{description}</Text>
                        {renderBenefits()}
                    </View>
                    <View style={subscriptionPlanCardActionButtonWrapStyles}>
                        <SubscriptionPlanCardActionButton
                            subscriptionPlan={subscriptionPlan}
                            isFromComparisonModal={isFromComparisonModal}
                            isSelected={isSelected}
                            style={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}
                            closeComparisonModal={closeComparisonModal}
                        />
                    </View>
                </>
            )}
        </View>
    );
}

export default SubscriptionPlanCard;
export type {PersonalPolicyTypeExcludedProps};
