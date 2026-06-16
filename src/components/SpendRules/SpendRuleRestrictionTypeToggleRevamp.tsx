import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import Icon from '@components/Icon';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

type SpendRuleRestrictionTypeToggleRevampProps = {
    restrictionAction: ValueOf<typeof CONST.SPEND_RULES.ACTION>;
    onSelect: (action: ValueOf<typeof CONST.SPEND_RULES.ACTION>) => void;
    label: string;
    icon?: IconAsset;
};

function SpendRuleRestrictionTypeToggleRevamp({restrictionAction, onSelect, label, icon}: SpendRuleRestrictionTypeToggleRevampProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const isAllowSelected = restrictionAction === CONST.SPEND_RULES.ACTION.ALLOW;
    const isBlockSelected = restrictionAction === CONST.SPEND_RULES.ACTION.BLOCK;

    return (
        <View style={[styles.flexRow, !!icon && styles.alignItemsCenter]}>
            {!!icon && (
                <Icon
                    src={icon}
                    width={variables.iconSizeNormal}
                    height={variables.iconSizeNormal}
                    fill={theme.icon}
                    additionalStyles={[styles.mr3]}
                />
            )}
            <Text style={[styles.flex1, styles.pr3, styles.alignSelfCenter]}>{label}</Text>
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
    );
}

SpendRuleRestrictionTypeToggleRevamp.displayName = 'SpendRuleRestrictionTypeToggleRevamp';

export default SpendRuleRestrictionTypeToggleRevamp;
