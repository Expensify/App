import Checkbox from '@components/Checkbox';
import MenuItem from '@components/MenuItem';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {getRequireFieldsFieldCouplingTooltipKey, isRequireFieldsFieldCouplingDisabled} from '@libs/RequireFieldsRulesUtils';
import type {FieldRequirementsDirection} from '@libs/RequireFieldsRulesUtils';

import CONST from '@src/CONST';
import type {RequireFieldsRuleForm, RequireFieldsRuleToggleFieldKey} from '@src/types/form/RequireFieldsRuleForm';

import React from 'react';
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
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const isChecked = !!effectiveForm?.[fieldKey];
    const isCouplingDisabled = isRequireFieldsFieldCouplingDisabled(fieldKey, direction, effectiveForm);
    const isReadOnly = !canWriteRules;
    const couplingTooltipKey = getRequireFieldsFieldCouplingTooltipKey(fieldKey, direction, effectiveForm);
    const couplingTooltip = couplingTooltipKey ? translate(`workspace.rules.requireFieldsRule.${couplingTooltipKey}`) : undefined;

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
            shouldRenderTooltip={!!couplingTooltip}
            renderTooltipContent={() => <Text style={[styles.productTrainingTooltipText, styles.textAlignCenter]}>{couplingTooltip}</Text>}
            tooltipWrapperStyle={[styles.mh4, styles.pv2, styles.productTrainingTooltipWrapper]}
            tooltipAnchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
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
