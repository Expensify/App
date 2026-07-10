import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getRequireFieldsFieldCouplingTooltipKey, isRequireFieldsFieldCouplingDisabled} from '@libs/RequireFieldsRulesUtils';
import type {FieldRequirementsDirection} from '@libs/RequireFieldsRulesUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {RequireFieldsRuleForm, RequireFieldsRuleSettingFieldKey} from '@src/types/form/RequireFieldsRuleForm';
import type {PolicyCategory} from '@src/types/onyx';

import React, {useCallback, useState} from 'react';
import {View} from 'react-native';

import FieldRequirementsDirectionToggle from './FieldRequirementsDirectionToggle';

type FieldRequirementSettingRowProps = {
    fieldKey: RequireFieldsRuleSettingFieldKey;
    label: string;
    setting: FieldRequirementsDirection;
    effectiveForm: RequireFieldsRuleForm | undefined;
    category: PolicyCategory | undefined;
    touchedFields: Set<RequireFieldsRuleSettingFieldKey>;
    canWriteRules: boolean;
    onSelectSetting: (fieldKey: RequireFieldsRuleSettingFieldKey, setting: FieldRequirementsDirection) => void;
};

function FieldRequirementSettingRow({fieldKey, label, setting, effectiveForm, category, touchedFields, canWriteRules, onSelectSetting}: FieldRequirementSettingRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Close', 'Lightbulb']);
    const [dismissedCouplingTooltipKey, setDismissedCouplingTooltipKey] = useState<string | undefined>();

    const isCouplingDisabled = isRequireFieldsFieldCouplingDisabled(fieldKey, effectiveForm, category, touchedFields);
    const isReadOnly = !canWriteRules;
    const couplingTooltipKey = getRequireFieldsFieldCouplingTooltipKey(fieldKey, effectiveForm, category, touchedFields);
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

    const handleSelectSetting = (newSetting: FieldRequirementsDirection) => {
        if (isReadOnly || isCouplingDisabled) {
            return;
        }

        onSelectSetting(fieldKey, newSetting);
    };

    const rowContent = (
        <View style={[styles.ph5, styles.pv3, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap3, styles.flexWrap]}>
            <Text style={[styles.textLabel, styles.flexShrink1]}>{label}</Text>
            <FieldRequirementsDirectionToggle
                direction={setting}
                disabled={isReadOnly || isCouplingDisabled}
                onSelect={handleSelectSetting}
            />
        </View>
    );

    if (!shouldMountCouplingTooltip) {
        return rowContent;
    }

    return (
        <EducationalTooltip
            shouldRender={shouldMountCouplingTooltip}
            shouldDisplayTooltip={shouldDisplayCouplingTooltip}
            renderTooltipContent={renderCouplingTooltipContent}
            wrapperStyle={styles.productTrainingTooltipWrapper}
            anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM}}
            shiftHorizontal={variables.mileageRateTooltipShiftHorizontal}
            shiftVertical={variables.mileageRateTooltipShiftVertical}
            onTooltipPress={hideCouplingTooltip}
            shouldHideOnScroll
        >
            {rowContent}
        </EducationalTooltip>
    );
}

export default FieldRequirementSettingRow;
