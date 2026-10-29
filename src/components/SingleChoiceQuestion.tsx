import useThemeStyles from '@hooks/useThemeStyles';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import type {ComponentRef, ForwardedRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text as RNText} from 'react-native';

import React from 'react';

import type {Choice} from './RadioButtons';

import FormFieldGroup from './Form/Layout/FormFieldGroup';
import FormMenuRows from './Form/Layout/FormMenuRows';
import RadioButtons from './RadioButtons';
import Text from './Text';

type SingleChoiceQuestionProps = ForwardedFSClassProps & {
    prompt: string;
    errorText?: string;
    possibleAnswers: Choice[];
    currentQuestionIndex: number;
    onInputChange: (value: string) => void;
    ref?: ForwardedRef<ComponentRef<typeof RNText>>;
};

function SingleChoiceQuestion({prompt, errorText, possibleAnswers, currentQuestionIndex, onInputChange, forwardedFSClass, ref}: SingleChoiceQuestionProps) {
    const styles = useThemeStyles();

    return (
        <FormMenuRows hasLabelAbove>
            <FormFieldGroup>
                <Text
                    ref={ref}
                    style={styles.ph5}
                >
                    {prompt}
                </Text>
                <RadioButtons
                    items={possibleAnswers}
                    key={currentQuestionIndex}
                    onSelect={onInputChange}
                    errorText={errorText}
                    forwardedFSClass={forwardedFSClass}
                />
            </FormFieldGroup>
        </FormMenuRows>
    );
}

export default SingleChoiceQuestion;
