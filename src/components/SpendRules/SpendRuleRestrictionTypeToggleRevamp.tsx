import Button from '@components/ButtonComposed';
import Icon from '@components/Icon';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

type SpendRuleRestrictionTypeToggleRevampProps = {
    restrictionAction: ValueOf<typeof CONST.SPEND_RULES.ACTION> | null;
    onSelect: (action: ValueOf<typeof CONST.SPEND_RULES.ACTION> | null) => void;
    icon?: IconAsset;
};

function SpendRuleRestrictionTypeToggleRevamp({restrictionAction, onSelect, icon}: SpendRuleRestrictionTypeToggleRevampProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const isOffSelected = restrictionAction === null;
    const isAllowSelected = restrictionAction === CONST.SPEND_RULES.ACTION.ALLOW;
    const isBlockSelected = restrictionAction === CONST.SPEND_RULES.ACTION.BLOCK;

    const restrictionTypeHelperText = (() => {
        if (isAllowSelected) {
            return translate('workspace.rules.spendRules.restrictMerchantsAllowSubtitle');
        }
        if (isBlockSelected) {
            return translate('workspace.rules.spendRules.restrictMerchantsBlockSubtitle');
        }
        return translate('workspace.rules.spendRules.restrictMerchantsOffSubtitle');
    })();

    return (
        <>
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
                <Text style={[styles.flex1, styles.pr3, styles.alignSelfCenter]}>{translate('workspace.rules.spendRules.restrictMerchants')}</Text>
                <View style={[styles.flexRow, styles.border, styles.borderRadiusNormal, styles.alignSelfStart]}>
                    <Button
                        onPress={() => onSelect(null)}
                        size={CONST.BUTTON_SIZE.SMALL}
                        style={styles.ph0}
                        innerStyles={!isOffSelected && styles.bgTransparent}
                        accessibilityLabel={translate('common.off')}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SPEND_RULE_RESTRICTION_TYPE}
                    >
                        <Button.Text style={[styles.alignSelfCenter, !isOffSelected && styles.textSupporting]}>{translate('common.off')}</Button.Text>
                    </Button>
                    <Button
                        onPress={() => onSelect(CONST.SPEND_RULES.ACTION.ALLOW)}
                        variant={isAllowSelected ? CONST.BUTTON_VARIANT.SUCCESS : undefined}
                        size={CONST.BUTTON_SIZE.SMALL}
                        style={styles.ph0}
                        innerStyles={!isAllowSelected && styles.bgTransparent}
                        accessibilityLabel={translate('workspace.rules.spendRules.allow')}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SPEND_RULE_RESTRICTION_TYPE}
                    >
                        <Button.Text style={[styles.alignSelfCenter, !isAllowSelected && styles.textSupporting]}>{translate('workspace.rules.spendRules.allow')}</Button.Text>
                    </Button>
                    <Button
                        onPress={() => onSelect(CONST.SPEND_RULES.ACTION.BLOCK)}
                        variant={isBlockSelected ? CONST.BUTTON_VARIANT.DANGER : undefined}
                        size={CONST.BUTTON_SIZE.SMALL}
                        style={styles.ph0}
                        innerStyles={!isBlockSelected && styles.bgTransparent}
                        accessibilityLabel={translate('workspace.rules.spendRules.block')}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SPEND_RULE_RESTRICTION_TYPE}
                    >
                        <Button.Text style={[styles.alignSelfCenter, !isBlockSelected && styles.textSupporting]}>{translate('workspace.rules.spendRules.block')}</Button.Text>
                    </Button>
                </View>
            </View>
            <Text style={[styles.mutedNormalTextLabel, styles.pt3]}>{restrictionTypeHelperText}</Text>
        </>
    );
}

SpendRuleRestrictionTypeToggleRevamp.displayName = 'SpendRuleRestrictionTypeToggleRevamp';

export default SpendRuleRestrictionTypeToggleRevamp;
