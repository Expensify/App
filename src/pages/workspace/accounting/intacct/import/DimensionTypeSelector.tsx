import React from 'react';
import {View} from 'react-native';
import FormHelpMessage from '@components/FormHelpMessage';
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
            value: CONST.SAGE_INTACCT_MAPPING_VALUE.TAG,
            text: translate('common.tag'),
            alternateText: translate('workspace.common.lineItemLevel'),
            keyForList: CONST.SAGE_INTACCT_MAPPING_VALUE.TAG,
            isSelected: value === CONST.SAGE_INTACCT_MAPPING_VALUE.TAG,
        },
        {
            value: CONST.SAGE_INTACCT_MAPPING_VALUE.REPORT_FIELD,
            text: translate('workspace.common.reportField'),
            alternateText: translate('workspace.common.reportLevel'),
            keyForList: CONST.SAGE_INTACCT_MAPPING_VALUE.REPORT_FIELD,
            isSelected: value === CONST.SAGE_INTACCT_MAPPING_VALUE.REPORT_FIELD,
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
            <View style={[styles.mhn5, styles.pb5, styles.mb0]}>
                {selectionOptions.map((option) => (
                    <RadioListItem
                        key={option.value}
                        item={option}
                        showTooltip={false}
                        isFocused={option.isSelected}
                        onSelectRow={onDimensionTypeSelected}
                    />
                ))}
                {!!errorText && (
                    <FormHelpMessage
                        style={styles.mh5}
                        isError={!!errorText}
                        message={errorText}
                    />
                )}
            </View>
        </View>
    );
}

export default DimensionTypeSelector;
