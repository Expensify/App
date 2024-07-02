import React from 'react';
import {View} from 'react-native';
import FormHelpMessage from '@components/FormHelpMessage';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type DimensionTypeSelectorProps = {
    /** Error text to display */
    errorText?: string;

    /** Business type to display */
    value?: string;

    /** Callback to call when the input changes */
    onInputChange?: (value: string) => void;
};

function DimensionTypeSelector({errorText = '', value = '', onInputChange}: DimensionTypeSelectorProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const selectionOptions = [
        {
            value: CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.TAG,
            text: translate('common.tag'),
            alternateText: translate('workspace.common.lineItemLevel'),
            keyForList: CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.TAG,
            isSelected: value === CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.TAG,
        },
        {
            value: CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.REPORT_FIELD,
            text: translate('workspace.common.reportField'),
            alternateText: translate('workspace.common.reportLevel'),
            keyForList: CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.REPORT_FIELD,
            isSelected: value === CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.REPORT_FIELD,
        },
    ];

    const onDimensionTypeSelected = (dimensionType: SelectorType) => {
        if (!onInputChange || dimensionType.value === value) {
            return;
        }
        onInputChange(dimensionType.value);
    };

    return (
        <View>
            <Text style={[styles.textLabelSupporting, styles.mb1]}>{translate('workspace.common.displayedAs')}</Text>
            <SelectionList
                onSelectRow={onDimensionTypeSelected}
                sections={[{data: selectionOptions}]}
                ListItem={RadioListItem}
                shouldShowTooltips={false}
                containerStyle={[styles.mhn5, styles.pb5, styles.mb0]}
                footerContent={
                    errorText ? (
                        <FormHelpMessage
                            isError={!!errorText}
                            message={errorText}
                        />
                    ) : undefined
                }
            />
        </View>
    );
}

export default DimensionTypeSelector;
