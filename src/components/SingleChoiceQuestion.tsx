import type {ForwardedRef} from 'react';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text as RNText} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import type {Choice} from './RadioButtons';
import RadioButtons from './RadioButtons';
import Text from './Text';

type SingleChoiceQuestionProps = ForwardedFSClassProps & {
    prompt: string;
    errorText?: string;
    possibleAnswers: Choice[];
    currentQuestionIndex: number;
    onInputChange: (value: string) => void;
    ref?: ForwardedRef<RNText>;
};

function SingleChoiceQuestion({prompt, errorText, possibleAnswers, currentQuestionIndex, onInputChange, forwardedFSClass, ref}: SingleChoiceQuestionProps) {
    const styles = useThemeStyles();

    return (
        <>
            <Text
                ref={ref}
                style={[styles.mt3]}
            >
                {prompt}
            </Text>
            <RadioButtons
                items={possibleAnswers}
                key={currentQuestionIndex}
                onPress={onInputChange}
                errorText={errorText}
                forwardedFSClass={forwardedFSClass}
            />
        </>
    );
}

export default SingleChoiceQuestion;
