import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Switch from '@components/Switch';
import Text from '@components/Text';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {dismissProductTraining} from '@libs/actions/Welcome';
import {
    canClearRequireFieldsField,
    getRequireFieldsFieldCouplingTooltipKey,
    isRequireFieldsFieldCouplingDisabled,
    REQUIRE_FIELDS_COUPLING_TOOLTIP_NAMES,
} from '@libs/RequireFieldsRulesUtils';
import type {FieldRequirementsDirection} from '@libs/RequireFieldsRulesUtils';
import isProductTrainingElementDismissed from '@libs/TooltipUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {RequireFieldsRuleForm, RequireFieldsRuleSettingFieldKey} from '@src/types/form/RequireFieldsRuleForm';
import type {PolicyCategory} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useCallback} from 'react';
import {View} from 'react-native';

import FieldRequirementsDirectionToggle from './FieldRequirementsDirectionToggle';

type FieldRequirementSettingRowProps = {
    fieldKey: RequireFieldsRuleSettingFieldKey;
    label: string;
    setting?: FieldRequirementsDirection;
    effectiveForm: RequireFieldsRuleForm | undefined;
    category: PolicyCategory | undefined;
    touchedFields: Set<RequireFieldsRuleSettingFieldKey>;
    clearedFields: Set<RequireFieldsRuleSettingFieldKey>;
    /** Fields the user toggled directly; used only for educational coupling tooltips. */
    couplingInteractionFields: Set<RequireFieldsRuleSettingFieldKey>;
    isEditing: boolean;
    canWriteRules: boolean;
    onSelectSetting: (fieldKey: RequireFieldsRuleSettingFieldKey, setting: FieldRequirementsDirection | undefined) => void;
};

function FieldRequirementSettingRow({
    fieldKey,
    label,
    setting,
    effectiveForm,
    category,
    touchedFields,
    clearedFields,
    couplingInteractionFields,
    isEditing,
    canWriteRules,
    onSelectSetting,
}: FieldRequirementSettingRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Close', 'Lightbulb']);
    const [dismissedProductTraining, dismissedProductTrainingMetadata] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING);

    const isCouplingDisabled = isRequireFieldsFieldCouplingDisabled(fieldKey, effectiveForm, category, touchedFields, isEditing, clearedFields);
    const couplingTooltipKey = getRequireFieldsFieldCouplingTooltipKey(fieldKey, effectiveForm, category, touchedFields, isEditing, clearedFields, couplingInteractionFields);
    const couplingTooltip = couplingTooltipKey ? translate(`workspace.rules.requireFieldsRule.${couplingTooltipKey}`) : undefined;
    const couplingTooltipName = couplingTooltipKey ? REQUIRE_FIELDS_COUPLING_TOOLTIP_NAMES[couplingTooltipKey] : undefined;
    // Wait for the NVP so an already-dismissed tooltip doesn't flash before the dismissal arrives.
    const shouldDisplayCouplingTooltip =
        !!couplingTooltip &&
        !!couplingTooltipName &&
        !isLoadingOnyxValue(dismissedProductTrainingMetadata) &&
        !isProductTrainingElementDismissed(couplingTooltipName, dismissedProductTraining);

    const hideCouplingTooltip = useCallback(
        (isDismissedUsingCloseButton = false) => {
            if (!couplingTooltipName) {
                return;
            }

            dismissProductTraining(couplingTooltipName, isDismissedUsingCloseButton);
        },
        [couplingTooltipName],
    );

    const renderCouplingTooltipContent = useCallback(() => {
        return (
            <View fsClass={CONST.FULLSTORY.CLASS.UNMASK}>
                <View style={[styles.alignItemsCenter, styles.flexRow, styles.justifyContentCenter, styles.textAlignCenter, styles.gap3, styles.pv2, styles.ph2]}>
                    <Icon
                        src={expensifyIcons.Lightbulb}
                        fill={theme.tooltipHighlightText}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                    />
                    <View style={[styles.flexShrink1]}>
                        <Text style={styles.productTrainingTooltipText}>{couplingTooltip}</Text>
                    </View>
                    <PressableWithoutFeedback
                        sentryLabel={CONST.SENTRY_LABEL.PRODUCT_TRAINING.TOOLTIP}
                        shouldUseAutoHitSlop
                        accessibilityLabel={translate('common.noThanks')}
                        role={CONST.ROLE.BUTTON}
                        onPress={() => hideCouplingTooltip(true)}
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

    const handleSelectSetting = (newSetting: FieldRequirementsDirection | undefined) => {
        if (!canWriteRules || isCouplingDisabled) {
            return;
        }

        onSelectSetting(fieldKey, newSetting);
    };

    // Receipt fields have a third state (no override, so the policy-level requirement applies) that a switch cannot
    // express, so they keep the direction pills. Description and Attendees are booleans and read better as a switch.
    const hasWaiveState = canClearRequireFieldsField(fieldKey);
    const isDisabled = !canWriteRules || isCouplingDisabled;

    const rowContent = (
        <View style={[styles.ph5, styles.pv3, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap3]}>
            <Text style={[styles.flexShrink1, styles.pr3, styles.alignSelfCenter]}>{label}</Text>
            {hasWaiveState ? (
                <FieldRequirementsDirectionToggle
                    direction={setting}
                    disabled={isDisabled}
                    onSelect={handleSelectSetting}
                />
            ) : (
                <Switch
                    isOn={setting === CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE}
                    disabled={isDisabled}
                    accessibilityLabel={label}
                    onToggle={(isOn) => handleSelectSetting(isOn ? CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE : CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE)}
                />
            )}
        </View>
    );

    if (!couplingTooltip) {
        return rowContent;
    }

    return (
        <EducationalTooltip
            shouldRender
            shouldDisplayTooltip={shouldDisplayCouplingTooltip}
            renderTooltipContent={renderCouplingTooltipContent}
            wrapperStyle={styles.productTrainingTooltipWrapper}
            anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM}}
            shiftHorizontal={variables.mileageRateTooltipShiftHorizontal}
            shiftVertical={variables.mileageRateTooltipShiftVertical}
            onTooltipPress={() => hideCouplingTooltip()}
            shouldHideOnScroll
        >
            {rowContent}
        </EducationalTooltip>
    );
}

export default FieldRequirementSettingRow;
