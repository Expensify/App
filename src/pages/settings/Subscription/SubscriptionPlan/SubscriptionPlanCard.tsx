import React from 'react';
import {FlatList, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import SelectCircle from '@components/SelectCircle';
import Text from '@components/Text';
import usePreferredCurrency from '@hooks/usePreferredCurrency';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getSubscriptionPlanInfo} from '@libs/SubscriptionUtils';
import variables from '@styles/variables';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SubscriptionPlanCardActionButton from './SubscriptionPlanCardActionButton';

type PersonalPolicyTypeExludedProps = Exclude<ValueOf<typeof CONST.POLICY.TYPE>, 'personal'>;

type SubscriptionPlanCardProps = {
    // TODO: add comments
    subscriptionPlan: PersonalPolicyTypeExludedProps | null;
    isFromComparisonModal?: boolean;
    closeComparisonModal?: () => void;
};

function SubscriptionPlanCard({subscriptionPlan, isFromComparisonModal = false, closeComparisonModal}: SubscriptionPlanCardProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const currentSubscriptionPlan = useSubscriptionPlan();
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);
    const preferredCurrency = usePreferredCurrency();
    const {title, src, description, benefits, note, subtitle} = getSubscriptionPlanInfo(subscriptionPlan, privateSubscription?.type, preferredCurrency);
    const isSelected = isFromComparisonModal && subscriptionPlan === currentSubscriptionPlan;
    const benefitsColumns = shouldUseNarrowLayout || isFromComparisonModal ? 1 : 2;

    return (
        <View style={[styles.borderedContentCard, styles.mt5, styles.flex1, isSelected && styles.borderColorFocus, styles.justifyContentBetween]}>
            <View style={styles.p5}>
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
                <Text style={[styles.labelStrong]}>{subtitle}</Text>
                <Text style={[styles.textLabelSupporting, styles.textSmall]}>{note}</Text>
                <Text style={[styles.textLabelSupporting, styles.textNormal, styles.mt3, styles.mb1]}>{description}</Text>
                <FlatList
                    key={shouldUseNarrowLayout ? 1 : 2}
                    data={benefits}
                    keyExtractor={(item) => item}
                    numColumns={benefitsColumns}
                    renderItem={({item}) => (
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.mt3]}>
                            <Icon
                                src={Expensicons.Checkmark}
                                fill={theme.iconSuccessFill}
                                width={variables.iconSizeSmall}
                                height={variables.iconSizeSmall}
                            />
                            <Text style={[styles.textLabelSupporting, styles.ml2]}>{item}</Text>
                        </View>
                    )}
                />
            </View>
            <View style={styles.pb5}>
                <SubscriptionPlanCardActionButton
                    subscriptionPlan={subscriptionPlan}
                    isFromComparisonModal={isFromComparisonModal}
                    isSelected={isSelected}
                    closeComparisonModal={closeComparisonModal}
                />
            </View>
        </View>
    );
}

SubscriptionPlanCard.displayName = 'SubscriptionPlanCard';

export default SubscriptionPlanCard;
export type {PersonalPolicyTypeExludedProps};
