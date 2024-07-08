import React, {useMemo} from 'react';
import {View} from 'react-native';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {ReviewDuplicates} from '@src/types/onyx';

type FieldItemType<T extends keyof ReviewDuplicates> = {
    text: string;
    value: ReviewDuplicates[T];
    keyForList: string;
};

type ReviewFieldsProps<K extends keyof ReviewDuplicates> = {
    /* Step Names which are displayed in stepper */
    stepNames: string[];

    /* Label which is displyed to describe current step  */
    label: string;

    /* Values to choose from */
    options: Array<{text: string; value: ReviewDuplicates[K]}> | undefined;

    /* Current index */
    index: number;

    /* Callback to what should happen after selecting row */
    onSelectRow: (item: FieldItemType<K>) => void;
};

function ReviewFields<K extends keyof ReviewDuplicates>({stepNames, label, options, index, onSelectRow}: ReviewFieldsProps<K>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    let falsyCount = 0;
    const filteredOptions = options?.filter((name) => {
        if (name.text !== translate('violations.none')) {
            return true;
        }
        falsyCount++;
        return falsyCount <= 1;
    });

    const sections = useMemo(
        () =>
            filteredOptions?.map((option) => ({
                text: option.text,
                keyForList: option.text,
                value: option.value,
            })),
        [filteredOptions],
    );

    return (
        <View
            key={index}
            style={styles.flex1}
        >
            {stepNames.length > 1 && (
                <View style={[styles.w100, styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                    <InteractiveStepSubHeader
                        stepNames={stepNames}
                        startStepIndex={index}
                    />
                </View>
            )}

            <Text
                family="EXP_NEW_KANSAS_MEDIUM"
                fontSize={variables.fontSizeLarge}
                style={[styles.pb5, styles.ph5, stepNames.length < 1 && styles.mt3]}
            >
                {label}
            </Text>
            <SelectionList
                sections={[{data: sections ?? []}]}
                ListItem={RadioListItem}
                onSelectRow={onSelectRow}
            />
        </View>
    );
}

ReviewFields.displayName = 'ReviewFields';

export default ReviewFields;
export type {FieldItemType};
