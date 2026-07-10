import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getRequireFieldsFieldCouplingTooltipKey, isRequireFieldsFieldCouplingDisabled} from '@libs/RequireFieldsRulesUtils';
import type {FieldRequirementsDirection} from '@libs/RequireFieldsRulesUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {RequireFieldsRuleForm, RequireFieldsRuleToggleFieldKey} from '@src/types/form/RequireFieldsRuleForm';

import React, {useCallback, useState} from 'react';
import {View} from 'react-native';

type FieldRequirementsToggleMenuItemProps = {
    fieldKey: RequireFieldsRuleToggleFieldKey;
    label: string;
    direction: FieldRequirementsDirection;
    effectiveForm: RequireFieldsRuleForm | undefined;
    canWriteRules: boolean;
    onToggle: (fieldKey: RequireFieldsRuleToggleFieldKey, value: boolean) => void;
};

function FieldRequirementsToggleMenuItem({fieldKey, label, direction, effectiveForm, canWriteRules, onToggle}: FieldRequirementsToggleMenuItemProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Close', 'Lightbulb']);
    const [dismissedCouplingTooltipKey, setDismissedCouplingTooltipKey] = useState<string | undefined>();

    const isChecked = !!effectiveForm?.[fieldKey];
    const isCouplingDisabled = isRequireFieldsFieldCouplingDisabled(fieldKey, direction, effectiveForm);
    const isReadOnly = !canWriteRules;
    const couplingTooltipKey = getRequireFieldsFieldCouplingTooltipKey(fieldKey, direction, effectiveForm);
    const couplingTooltip = couplingTooltipKey ? translate(`workspace.rules.requireFieldsRule.${couplingTooltipKey}`) : undefined;
    const shouldMountCouplingTooltip = !!couplingTooltip;
    const shouldDisplayCouplingTooltip = shouldMountCouplingTooltip && dismissedCouplingTooltipKey !== couplingTooltipKey;

    const hideCouplingTooltip = useCallback(() => {
        setDismissedCouplingTooltipKey(couplingTooltipKey);
    }, [couplingTooltipKey]);

    const renderCouplingTooltipContent = useCallback(() => {
        return (
            <View fsClass={CONST.FULLSTORY.CLASS.UNMASK}>
                <View style={[styles.alignItemsCenter, styles.flexRow, styles.justifyContentCenter, styles.textAlignCenter, styles.gap3, styles.pv2, styles.ph2]}>
                    <Icon
                        src={expensifyIcons.Lightbulb}
                        fill={theme.tooltipHighlightText}
                        size={CONST.ICON_SIZE.MEDIUM}
                    />
                    <View style={[styles.flexShrink1]}>
                        <Text style={styles.productTrainingTooltipText}>{couplingTooltip}</Text>
                    </View>
                    <PressableWithoutFeedback
                        sentryLabel={CONST.SENTRY_LABEL.PRODUCT_TRAINING.TOOLTIP}
                        shouldUseAutoHitSlop
                        accessibilityLabel={translate('common.noThanks')}
                        role={CONST.ROLE.BUTTON}
                        onPress={hideCouplingTooltip}
                    >
                        <Icon
                            src={expensifyIcons.Close}
                            fill={theme.icon}
                            width={variables.iconSizeSemiSmall}
                            height={variables.iconSizeSemiSmall}
                        />
                    </PressableWithoutFeedback>
                </View>
            </View>
        );
    }, [
        couplingTooltip,
        expensifyIcons.Close,
        expensifyIcons.Lightbulb,
        hideCouplingTooltip,
        styles.alignItemsCenter,
        styles.flexRow,
        styles.flexShrink1,
        styles.gap3,
        styles.justifyContentCenter,
        styles.ph2,
        styles.productTrainingTooltipText,
        styles.pv2,
        styles.textAlignCenter,
        theme.icon,
        theme.tooltipHighlightText,
        translate,
    ]);

    const toggleField = () => {
        if (isReadOnly || isCouplingDisabled) {
            return;
        }

        onToggle(fieldKey, !isChecked);
    };

    return (
        <MenuItem
            title={label}
            onPress={toggleField}
            disabled={isReadOnly}
            interactive={canWriteRules && !isCouplingDisabled}
            shouldGreyOutWhenDisabled={!isCouplingDisabled}
            shouldRenderTooltip={shouldMountCouplingTooltip}
            shouldDisplayEducationalTooltip={shouldDisplayCouplingTooltip}
            renderTooltipContent={renderCouplingTooltipContent}
            tooltipWrapperStyle={styles.productTrainingTooltipWrapper}
            tooltipAnchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM}}
            tooltipShiftHorizontal={variables.mileageRateTooltipShiftHorizontal}
            tooltipShiftVertical={variables.mileageRateTooltipShiftVertical}
            onEducationTooltipPress={hideCouplingTooltip}
            shouldHideOnScroll
            shouldShowRightComponent
            rightComponent={
                <View style={[styles.pointerEventsAuto, StyleUtils.getMenuItemIconStyle(true), styles.alignItemsEnd]}>
                    <Checkbox
                        isChecked={isChecked}
                        onPress={toggleField}
                        accessibilityLabel={label}
                        accessible={false}
                        disabled={isReadOnly || isCouplingDisabled}
                    />
                </View>
            }
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.REQUIRE_FIELDS_RULE_FIELD_TOGGLE}
        />
    );
}

export default FieldRequirementsToggleMenuItem;
