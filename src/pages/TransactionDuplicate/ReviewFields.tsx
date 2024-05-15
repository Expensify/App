import React, {useMemo} from 'react';
import {View} from 'react-native';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem, SectionListDataType} from '@components/SelectionList/types';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type ReviewFieldsProps = {
    stepNames: string[];
    label: string;
    options: Array<{text: string; value: unknown}>;
    index: number;
    onSelectRow: (item: ListItem) => void;
};

function ReviewFields({stepNames, label, options, index, onSelectRow}: ReviewFieldsProps) {
    const styles = useThemeStyles();
    let falsyCount = 0;
    const filteredOptions = options.filter((name) => {
        if (name.text !== 'None') {
            return true;
        }
        falsyCount++;
        return falsyCount <= 1;
    });
    const sections: Array<SectionListDataType<ListItem>> = useMemo(
        () =>
            filteredOptions.map((option) => ({
                data: [
                    {
                        text: option.text,
                        keyForList: option.value,
                        searchText: option.text,
                        tooltipText: option.text,
                        isDisabled: false,
                        isSelected: false,
                        data: option.value,
                    },
                ],
            })),
        [filteredOptions],
    );

    return (
        <View
            key={index}
            style={styles.flex1}
        >
            <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                {stepNames.length > 1 && (
                    <InteractiveStepSubHeader
                        stepNames={stepNames}
                        startStepIndex={index}
                    />
                )}
            </View>

            <Text
                family="EXP_NEW_KANSAS_MEDIUM"
                fontSize={variables.fontSizeLarge}
                style={[styles.pb5, styles.ph5]}
            >
                {label}
            </Text>
            <SelectionList
                sections={sections}
                ListItem={RadioListItem}
                onSelectRow={onSelectRow}
            />
        </View>
    );
}

export default ReviewFields;
