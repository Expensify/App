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

function NetSuiteCustomFieldMappingPicker({value, errorText, onInputChange}: NetSuiteCustomListPickerProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const options = [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG, CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD];

    const selectionData =
        options.map((option) => ({
            text: translate(`workspace.netsuite.import.importTypes.${option}.label`),
            keyForList: option,
            isSelected: value === option,
            value: option,
            alternateText: translate(`workspace.netsuite.import.importTypes.${option}.description`),
        })) ?? [];

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

export default NetSuiteCustomFieldMappingPicker;
