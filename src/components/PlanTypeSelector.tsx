import React, {useRef, useState} from 'react';
import type {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getUserFriendlyWorkspaceType} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import HeaderWithBackButton from './HeaderWithBackButton';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import Modal from './Modal';
import ScreenWrapper from './ScreenWrapper';
import SelectionList from './SelectionList';
import RadioListItem from './SelectionList/ListItem/RadioListItem';
import Text from './Text';

type PlanTypeItem = {
    value: ValueOf<typeof CONST.POLICY.TYPE>;
    text: string;
    alternateText: string;
    keyForList: ValueOf<typeof CONST.POLICY.TYPE>;
    isSelected: boolean;
};

type PlanTypeSelectorProps = {
    /** Form error text. e.g when no plan type is selected */
    errorText?: string;

    /** Callback called when the plan type changes. */
    onInputChange?: (value?: string, key?: string) => void;

    /** Current selected plan type */
    value?: string;

    /** inputID used by the Form component */
    // eslint-disable-next-line react/no-unused-prop-types
    inputID: string;

    /** Callback to call when the picker modal is dismissed */
    onBlur?: () => void;

    /** Label for the input */
    label?: string;
};

function PlanTypeSelector({errorText = '', value: planType, onInputChange = () => {}, onBlur, label}: PlanTypeSelectorProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const inputRef = useRef<View>(null);
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const handlePlanTypeSelect = (option: PlanTypeItem) => {
        onInputChange?.(option.value);
        hidePickerModal();
    };

    const getPlanTypeDisplayText = () => {
        if (!planType) {
            return '';
        }
        return getUserFriendlyWorkspaceType(planType as ValueOf<typeof CONST.POLICY.TYPE>, translate);
    };

    // Create plan type options
    const planTypeOptions: PlanTypeItem[] = Object.values(CONST.POLICY.TYPE)
        .filter((type) => type !== CONST.POLICY.TYPE.PERSONAL)
        .map((policyType) => ({
            value: policyType,
            text: translate(`workspace.planTypePage.planTypes.${policyType}.label`),
            alternateText: translate(`workspace.planTypePage.planTypes.${policyType}.description`),
            keyForList: policyType,
            isSelected: policyType === planType,
        }));

    return (
        <>
            <MenuItemWithTopDescription
                ref={inputRef}
                shouldShowRightIcon
                title={getPlanTypeDisplayText()}
                description={label ?? translate('workspace.common.planType')}
                onPress={showPickerModal}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
                onBlur={onBlur}
            />
            <Modal
                type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
                isVisible={isPickerVisible}
                onClose={hidePickerModal}
                onModalHide={hidePickerModal}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <ScreenWrapper
                    style={styles.pb0}
                    includePaddingTop={false}
                    enableEdgeToEdgeBottomSafeAreaPadding
                    testID="PlanTypeSelectorModal"
                >
                    <HeaderWithBackButton
                        title={label ?? translate('workspace.common.planType')}
                        shouldShowBackButton
                        onBackButtonPress={hidePickerModal}
                    />
                    <Text style={[styles.ph5, styles.pb4, styles.sidebarLinkText, styles.optionAlternateText]}>{translate('workspace.planTypePage.description')}</Text>
                    <SelectionList
                        data={planTypeOptions}
                        ListItem={RadioListItem}
                        onSelectRow={handlePlanTypeSelect}
                        shouldSingleExecuteRowSelect
                        initiallyFocusedItemKey={planTypeOptions.find((option) => option.isSelected)?.keyForList}
                        addBottomSafeAreaPadding
                    />
                </ScreenWrapper>
            </Modal>
        </>
    );
}

PlanTypeSelector.displayName = 'PlanTypeSelector';

export default PlanTypeSelector;
