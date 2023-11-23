import React, {ForwardedRef, forwardRef, useEffect} from 'react';
import {Text as RNText} from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';
import FormHelpMessage from './FormHelpMessage';
import RadioButtons, {Choice} from './RadioButtons';
import Text from './Text';

type SingleChoiceQuestionProps = {
    prompt: string;
    errorText?: string | string[];
    possibleAnswers: Choice[];
    currentQuestionIndex: number;
    onInputChange: (value: string) => void;
};

function SingleChoiceQuestion({prompt, errorText, possibleAnswers, currentQuestionIndex, onInputChange}: SingleChoiceQuestionProps, ref: ForwardedRef<RNText>) {
    const styles = useThemeStyles();

    useEffect(() => {
        if (!ref || !('current' in ref) || !ref.current) {
            return;
        }
        // To prevent crashes after pressing fix the errors we need to add focus property to the ref
        // eslint-disable-next-line no-param-reassign
        ref.current.focus = () => {};
    }, [ref]);

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
