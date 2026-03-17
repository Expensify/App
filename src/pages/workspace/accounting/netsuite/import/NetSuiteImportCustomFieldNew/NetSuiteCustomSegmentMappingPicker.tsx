import React from 'react';
import {View} from 'react-native';
import FormHelpMessage from '@components/FormHelpMessage';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type NetSuiteCustomListPickerProps = {
    /** Selected mapping value */
    value?: string;

    /** Text to display on error message */
    errorText?: string;

    /** Callback to fire when mapping is selected */
    onInputChange?: (value: string) => void;
};

function NetSuiteCustomSegmentMappingPicker({value, errorText, onInputChange}: NetSuiteCustomListPickerProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const selectionData = [
        {
            text: translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.segmentTitle`),
            keyForList: CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT,
            isSelected: value === CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT,
            value: CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT,
        },
        {
            text: translate(`workspace.netsuite.import.importCustomFields.customSegments.addForm.recordTitle`),
            keyForList: CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_RECORD,
            isSelected: value === CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_RECORD,
            value: CONST.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_RECORD,
        },
    ];

    return (
        <>
            <SelectionList
                data={selectionData}
                onSelectRow={(selected) => {
                    onInputChange?.(selected.value);
                }}
                ListItem={RadioListItem}
                initiallyFocusedItemKey={value ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG}
                shouldSingleExecuteRowSelect
                shouldUpdateFocusedIndex
            />
            {!!errorText && (
                <View style={styles.ph5}>
                    <FormHelpMessage
                        isError={!!errorText}
                        message={errorText}
                    />
                </View>
            )}
        </>
    );
}

export default NetSuiteCustomSegmentMappingPicker;
