import React, {useMemo} from 'react';
import {View} from 'react-native';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem, SectionListDataType} from '@components/SelectionList/types';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

type ReviewFieldsProps = {
    stepNames: string[];
    label: string;
    options: string[];
    index: number;
    onSelectRow: () => void;
};

function ReviewFields({stepNames, label, options, index, onSelectRow}: ReviewFieldsProps) {
    const styles = useThemeStyles();
    let falsyCount = 0;
    const filteredOptions = options.filter((name) => {
        if (name) {
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
                        text: !option ? 'None' : option,
                        keyForList: !option ? 'None' : option,
                        searchText: !option ? 'None' : option,
                        tooltipText: !option ? 'None' : option,
                        isDisabled: false,
                        isSelected: false,
                        data: !option ? 'None' : option,
                    },
                ],
            })),
        [filteredOptions],
    );

    return (
        <>
            <View style={styles.ph5}>
                {stepNames.length > 1 && (
                    <InteractiveStepSubHeader
                        stepNames={stepNames}
                        startStepIndex={index}
                    />
                )}
                <View style={styles.pt5}>
                    <Text
                        family="EXP_NEW_KANSAS_MEDIUM"
                        fontSize={variables.fontSizeLarge}
                        style={styles.pb5}
                    >
                        {label}
                    </Text>
                </View>
            </View>
            <View>
                <SelectionList
                    sections={sections}
                    ListItem={RadioListItem}
                    onSelectRow={onSelectRow}
                />
            </View>
        </>
    );
}

ReviewFields.displayName = 'ReviewFields';
export default ReviewFields;
