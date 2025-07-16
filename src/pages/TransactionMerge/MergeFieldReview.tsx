import React from 'react';
import {View} from 'react-native';
import FormHelpMessage from '@components/FormHelpMessage';
import {PressableWithoutFeedback} from '@components/Pressable';
import RadioButton from '@components/RadioButton';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {MergeValueType} from '@libs/MergeTransactionUtils';

type MergeFieldReviewProps = {
    field: string;
    values: MergeValueType[];
    selectedValue: MergeValueType;
    onValueSelected: (selected: MergeValueType) => void;
    errorText: string | undefined;
};

function MergeFieldReview({field, values, selectedValue, onValueSelected, errorText}: MergeFieldReviewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.mb3, styles.pv5, styles.borderRadiusComponentLarge, styles.highlightBG]}>
            <Text style={[styles.textSupporting, styles.pb3, styles.ph5]}>{field}</Text>
            {values.map((value: MergeValueType) => {
                const isSelected = value === selectedValue;
                // Convert boolean to translated "Yes"/"No", otherwise keep as is
                let valueInString: string;
                if (typeof value === 'boolean') {
                    valueInString = value ? translate('common.yes') : translate('common.no');
                } else {
                    valueInString = String(value);
                }

                return (
                    <PressableWithoutFeedback
                        key={valueInString}
                        onPress={() => onValueSelected(value)}
                        accessibilityLabel={valueInString}
                        accessible={false}
                        hoverStyle={!isSelected ? styles.hoveredComponentBG : undefined}
                        style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.pv5, styles.ph5, isSelected && styles.activeComponentBG]}
                    >
                        <Text style={[styles.mr1, styles.textBold]}>{valueInString}</Text>
                        <RadioButton
                            isChecked={isSelected}
                            onPress={() => onValueSelected(value)}
                            accessibilityLabel={valueInString}
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

export default MergeFieldReview;
