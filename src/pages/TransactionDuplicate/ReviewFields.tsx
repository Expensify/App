import React from 'react';
import {View} from 'react-native';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

type ReviewFieldsProps = {
    stepNames: string[];
    label: string;
    options: string[];
    index: number;
};

function ReviewFields({stepNames, label, options, index}: ReviewFieldsProps) {
    const styles = useThemeStyles();
    return (
        <View>
            <InteractiveStepSubHeader
                stepNames={stepNames}
                startStepIndex={index}
            />
            <Text>{label}</Text>
            {options.map((option) => (
                <Text key={option}>{option}</Text>
            ))}
        </View>
    );
}

ReviewFields.displayName = 'ReviewFields';
export default ReviewFields;
