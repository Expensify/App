import React from 'react';
import {View} from 'react-native';
import type {SvgProps} from 'react-native-svg';
import type {ValueOf} from 'type-fest';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithFeedback} from '@components/Pressable';
import SelectCircle from '@components/SelectCircle';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type CONST from '@src/CONST';

type PersonalPolicyTypeExludedProps = Exclude<ValueOf<typeof CONST.POLICY.TYPE>, 'personal'>;

type SubscriptionPlanCardProps = {
    index: number;
    plan: {
        title: string;
        src: React.FC<SvgProps>;
        benefits: string[];
        description: string;
        isSelected: boolean;
        type: PersonalPolicyTypeExludedProps;
    };

    onPress: (type: PersonalPolicyTypeExludedProps) => void;
};
function SubscriptionPlanCard({plan, index, onPress}: SubscriptionPlanCardProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.borderedContentCard, styles.flex1, styles.mt5, styles.p5, index === 0 && styles.mr3]}>
            <PressableWithFeedback
                accessibilityLabel={plan.title}
                wrapperStyle={[styles.flex1]}
                onPress={() => onPress(plan.type)}
            >
                <View style={[styles.flexRow, styles.justifyContentBetween]}>
                    <Icon
                        src={plan.src}
                        width={variables.iconHeader}
                        height={variables.iconHeader}
                    />
                    <View>
                        <SelectCircle
                            isChecked={plan.isSelected}
                            selectCircleStyles={styles.sectionSelectCircle}
                        />
                    </View>
                </View>
                <Text style={[styles.headerText, styles.mv2]}>{plan.title}</Text>
                <Text style={[styles.textLabelSupporting, styles.mb2]}>{plan.description}</Text>
                {plan.benefits.map((benefit) => (
                    <View
                        style={[styles.flexRow, styles.alignItemsCenter, styles.mt2]}
                        key={benefit}
                    >
                        <Icon
                            src={Expensicons.Checkmark}
                            fill={theme.iconSuccessFill}
                            width={variables.iconSizeSmall}
                            height={variables.iconSizeSmall}
                        />
                        <Text style={[styles.textMicroSupporting, styles.ml2]}>{benefit}</Text>
                    </View>
                ))}
            </PressableWithFeedback>
        </View>
    );
}

SubscriptionPlanCard.displayName = 'SubscriptionPlanCard';

export default SubscriptionPlanCard;
export type {PersonalPolicyTypeExludedProps};
