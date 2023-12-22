import React, {ForwardedRef, forwardRef} from 'react';
import {Text as RNText} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type {MaybePhraseKey} from '@libs/Localize';
import FormHelpMessage from './FormHelpMessage';
import RadioButtons, {Choice} from './RadioButtons';
import Text from './Text';

type SingleChoiceQuestionProps = {
    prompt: string;
    errorText?: MaybePhraseKey;
    possibleAnswers: Choice[];
    currentQuestionIndex: number;
    onInputChange: (value: string) => void;
};

function SingleChoiceQuestion({prompt, errorText, possibleAnswers, currentQuestionIndex, onInputChange}: SingleChoiceQuestionProps, ref: ForwardedRef<RNText>) {
    const styles = useThemeStyles();

    return (
        <>
            <Text
                ref={ref}
                style={[styles.textStrong, styles.mb5]}
            >
                {prompt}
            </Text>
            <RadioButtons
                items={possibleAnswers}
                key={currentQuestionIndex}
                onPress={onInputChange}
            />
            <FormHelpMessage message={errorText} />
        </>
    );
}

SingleChoiceQuestion.displayName = 'SingleChoiceQuestion';

export default forwardRef(SingleChoiceQuestion);
