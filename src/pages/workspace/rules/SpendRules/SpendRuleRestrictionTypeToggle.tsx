import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type SpendRuleRestrictionTypeToggleProps = {
    restrictionAction: ValueOf<typeof CONST.SPEND_CARD_RULE.ACTION>;
    onSelect: (action: ValueOf<typeof CONST.SPEND_CARD_RULE.ACTION>) => void;
};

function SpendRuleRestrictionTypeToggle({restrictionAction, onSelect}: SpendRuleRestrictionTypeToggleProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const segmentBaseStyle: StyleProp<ViewStyle> = [styles.ph3, styles.pv1, styles.alignItemsCenter, styles.justifyContentCenter];
    const segmentTextBase: StyleProp<TextStyle> = [styles.textLabel, styles.textNoWrap];

    const getAllowStyles = (isSelected: boolean): {container: StyleProp<ViewStyle>; text: StyleProp<TextStyle>} => ({
        container: [...segmentBaseStyle, isSelected ? {backgroundColor: theme.success} : undefined, {borderRadius: variables.componentBorderRadiusSmall}],
        text: [...segmentTextBase, isSelected ? {color: theme.textReversed} : {color: theme.textSupporting}],
    });

    const getBlockStyles = (isSelected: boolean): {container: StyleProp<ViewStyle>; text: StyleProp<TextStyle>} => ({
        container: [...segmentBaseStyle, isSelected ? {backgroundColor: colors.tangerine400} : undefined, {borderRadius: variables.componentBorderRadiusSmall}],
        text: [...segmentTextBase, isSelected ? {color: theme.textReversed} : {color: theme.textSupporting}],
    });

    const allowStyles = getAllowStyles(restrictionAction === CONST.SPEND_CARD_RULE.ACTION.ALLOW);
    const blockStyles = getBlockStyles(restrictionAction === CONST.SPEND_CARD_RULE.ACTION.BLOCK);

    const restrictionTypeHelperText =
    restrictionAction === CONST.SPEND_CARD_RULE.ACTION.ALLOW
        ? translate('workspace.rules.spendRules.restrictionTypeHelpAllow')
        : translate('workspace.rules.spendRules.restrictionTypeHelpBlock');

    return (
        <View
            style={[
                styles.flexRow,
                {
                    padding: 2,
                    borderRadius: variables.componentBorderRadiusSmall,
                    backgroundColor: theme.border,
                    minWidth: variables.componentSizeLarge,
                },
            ]}
        >
            <Text style={[styles.textLabelSupporting, styles.flex1, styles.pr3]}>{translate('workspace.rules.spendRules.restrictionType')}</Text>
            <PressableWithFeedback
                onPress={() => onSelect(CONST.SPEND_CARD_RULE.ACTION.ALLOW)}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('workspace.rules.spendRules.allow')}
                style={[styles.flex1, allowStyles.container]}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SPEND_RULE_RESTRICTION_TYPE}
            >
                <Text style={allowStyles.text}>{translate('workspace.rules.spendRules.allow')}</Text>
            </PressableWithFeedback>
            <PressableWithFeedback
                onPress={() => onSelect(CONST.SPEND_CARD_RULE.ACTION.BLOCK)}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('workspace.rules.spendRules.block')}
                style={[styles.flex1, blockStyles.container]}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SPEND_RULE_RESTRICTION_TYPE}
            >
                <Text style={blockStyles.text}>{translate('workspace.rules.spendRules.block')}</Text>
            </PressableWithFeedback>
            <Text style={[styles.mutedNormalTextLabel, styles.pt2]}>{restrictionTypeHelperText}</Text>
        </View>
    );
}

SpendRuleRestrictionTypeToggle.displayName = 'SpendRuleRestrictionTypeToggle';

export default SpendRuleRestrictionTypeToggle;
export type {SpendRuleRestrictionTypeToggleProps};
