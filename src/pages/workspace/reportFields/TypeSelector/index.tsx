import {Str} from 'expensify-common';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useState} from 'react';
import {View} from 'react-native';
import type {MenuItemBaseProps} from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import * as WorkspaceReportFieldUtils from '@libs/WorkspaceReportFieldUtils';
import type {ReportFieldItemType} from '@pages/workspace/reportFields/ReportFieldTypePicker';
import CONST from '@src/CONST';
import type {PolicyReportFieldType} from '@src/types/onyx/Policy';
import TypeSelectorModal from './TypeSelectorModal';

type TypeSelectorProps = Pick<MenuItemBaseProps, 'label' | 'rightLabel' | 'errorText'> & {
    /** Currently selected type */
    value?: string;

    /** Subtitle to display on field */
    subtitle?: string;

    /** Function to call when the user selects a type */
    onInputChange?: (value: string) => void;

    /** Function to call when the user selects a type */
    onTypeSelected?: (reportFieldType: PolicyReportFieldType) => void;
};

function TypeSelector({value, label = '', rightLabel, subtitle = '', errorText = '', onInputChange, onTypeSelected}: TypeSelectorProps, forwardedRef: ForwardedRef<View>) {
    const {translate} = useLocalize();

    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateTypeInput = (reportField: ReportFieldItemType) => {
        onInputChange?.(reportField.value);
        onTypeSelected?.(reportField.value);
        hidePickerModal();
    };

    return (
        <View>
            <MenuItemWithTopDescription
                ref={forwardedRef}
                shouldShowRightIcon
                title={value ? Str.recapitalize(translate(WorkspaceReportFieldUtils.getReportFieldTypeTranslationKey(value as PolicyReportFieldType))) : ''}
                description={label}
                rightLabel={rightLabel}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
                onPress={showPickerModal}
            />
            <TypeSelectorModal
                isVisible={isPickerVisible}
                currentType={value as PolicyReportFieldType}
                onClose={hidePickerModal}
                onTypeSelected={updateTypeInput}
                label={label}
                subtitle={subtitle}
            />
        </View>
    );
}

TypeSelector.displayName = 'TypeSelector';

export default forwardRef(TypeSelector);
