import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SpendRuleRestrictionTypeToggleProps = {
    restrictionAction: ValueOf<typeof CONST.SPEND_RULES.ACTION>;
    onSelect: (action: ValueOf<typeof CONST.SPEND_RULES.ACTION>) => void;
};

function SpendRuleRestrictionTypeToggle({restrictionAction, onSelect}: SpendRuleRestrictionTypeToggleProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const isAllowSelected = restrictionAction === CONST.SPEND_RULES.ACTION.ALLOW;
    const isBlockSelected = restrictionAction === CONST.SPEND_RULES.ACTION.BLOCK;

    const restrictionTypeHelperText = isAllowSelected ? translate('workspace.rules.spendRules.restrictionTypeHelpAllow') : translate('workspace.rules.spendRules.restrictionTypeHelpBlock');

    return (
        <>
            <View style={[styles.flexRow]}>
                <Text style={[styles.flex1, styles.pr3, styles.alignSelfCenter]}>{translate('workspace.rules.spendRules.restrictionType')}</Text>
                <View style={[styles.flexRow, styles.border, styles.borderRadiusNormal]}>
                    <Button
                        text={translate('workspace.rules.spendRules.allow')}
                        onPress={() => onSelect(CONST.SPEND_RULES.ACTION.ALLOW)}
                        success={isAllowSelected}
                        small
                        style={styles.ph0}
                        innerStyles={!isAllowSelected ? styles.bgTransparent : undefined}
                        textStyles={[styles.alignSelfCenter, !isAllowSelected ? styles.textSupporting : undefined]}
                        accessibilityLabel={translate('workspace.rules.spendRules.allow')}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SPEND_RULE_RESTRICTION_TYPE}
                    />
                    <Button
                        text={translate('workspace.rules.spendRules.block')}
                        onPress={() => onSelect(CONST.SPEND_RULES.ACTION.BLOCK)}
                        danger={isBlockSelected}
                        small
                        style={styles.ph0}
                        innerStyles={!isBlockSelected ? styles.bgTransparent : undefined}
                        textStyles={[styles.alignSelfCenter, !isBlockSelected ? styles.textSupporting : undefined]}
                        accessibilityLabel={translate('workspace.rules.spendRules.block')}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SPEND_RULE_RESTRICTION_TYPE}
                    />
                </View>
            </View>
            <Text style={[styles.mutedNormalTextLabel, styles.pt3]}>{restrictionTypeHelperText}</Text>
        </>
    );
}

SpendRuleRestrictionTypeToggle.displayName = 'SpendRuleRestrictionTypeToggle';

export default SpendRuleRestrictionTypeToggle;
export type {SpendRuleRestrictionTypeToggleProps};
