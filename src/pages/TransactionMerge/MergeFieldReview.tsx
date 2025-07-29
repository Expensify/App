import React from 'react';
import {View} from 'react-native';
import FormHelpMessage from '@components/FormHelpMessage';
import {PressableWithoutFeedback} from '@components/Pressable';
import RadioButton from '@components/RadioButton';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import type {MergeValue} from '@libs/MergeTransactionUtils';

type MergeFieldReviewProps = {
    field: string;
    values: MergeValue[];
    selectedValue: MergeValue;
    onValueSelected: (selected: MergeValue) => void;
    errorText: string | undefined;
    formatValue: (mergeValue: MergeValue) => string;
};

function MergeFieldReview({field, values, selectedValue, onValueSelected, errorText, formatValue}: MergeFieldReviewProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.mb3, styles.pv5, styles.borderRadiusComponentLarge, styles.highlightBG]}>
            <Text style={[styles.textSupporting, styles.pb3, styles.ph5]}>{field}</Text>
            {values.map((mergeValue: MergeValue) => {
                const {value, currency} = mergeValue;
                const displayValue = formatValue(mergeValue);
                const isSelected = selectedValue.value === value && (!currency || selectedValue.currency === currency);

                return (
                    <PressableWithoutFeedback
                        key={`${value}${currency}`}
                        onPress={() => onValueSelected(mergeValue)}
                        accessibilityLabel={formatValue(mergeValue)}
                        accessible={false}
                        hoverStyle={!isSelected ? styles.hoveredComponentBG : undefined}
                        style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.pv5, styles.ph5, isSelected && styles.activeComponentBG]}
                    >
                        <Text style={[styles.mr1, styles.textBold]}>{displayValue}</Text>
                        <RadioButton
                            isChecked={isSelected}
                            onPress={() => onValueSelected(mergeValue)}
                            accessibilityLabel={displayValue}
                            newRadioButtonStyle
                        />
                    </PressableWithoutFeedback>
                );
            })}
            {!!errorText && (
                <FormHelpMessage
                    message={errorText}
                    style={[styles.ph5]}
                />
            )}
        </View>
    );
}

MergeFieldReview.displayName = 'MergeFieldReview';

export default MergeFieldReview;
