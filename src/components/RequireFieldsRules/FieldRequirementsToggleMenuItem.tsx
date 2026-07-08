import Checkbox from '@components/Checkbox';
import MenuItem from '@components/MenuItem';

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
    const isFieldDisabled = !canWriteRules || isCouplingDisabled;
    const couplingTooltipKey = getRequireFieldsFieldCouplingTooltipKey(fieldKey, direction, effectiveForm);
    const couplingTooltip = couplingTooltipKey ? translate(`workspace.rules.requireFieldsRule.${couplingTooltipKey}`) : undefined;

    const toggleField = () => {
        if (isFieldDisabled) {
            return;
        }

        onToggle(fieldKey, !isChecked);
    };

    return (
        <MenuItem
            title={label}
            onPress={toggleField}
            disabled={isFieldDisabled}
            interactive={canWriteRules && !isCouplingDisabled}
            shouldGreyOutWhenDisabled={!isCouplingDisabled}
            shouldRenderTooltip={!!couplingTooltip}
            renderTooltipContent={() => couplingTooltip}
            shouldShowRightComponent
            rightComponent={
                <View style={[styles.pointerEventsAuto, StyleUtils.getMenuItemIconStyle(true), styles.alignItemsEnd]}>
                    <Checkbox
                        isChecked={isChecked}
                        onPress={toggleField}
                        accessibilityLabel={label}
                        accessible={false}
                        disabled={isFieldDisabled}
                    />
                </View>
            }
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.REQUIRE_FIELDS_RULE_FIELD_TOGGLE}
        />
    );
}

FieldRequirementsToggleMenuItem.displayName = 'FieldRequirementsToggleMenuItem';

export default FieldRequirementsToggleMenuItem;
