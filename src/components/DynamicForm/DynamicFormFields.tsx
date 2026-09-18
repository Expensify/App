import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {WiseField} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

import type {DynamicFormValues} from './types';

import getInputComponentForField, {getFieldLabel} from './getInputComponentForField';
import isFieldVisible from './isFieldVisible';

type DynamicFormFieldsProps = {
    fields: WiseField[];

    /** Current answers, from FormProvider's render-prop `inputValues`, so showWhen and dependsOn follow the user's typing */
    values: DynamicFormValues;

    /** Currency for amount fields when the form has no `currency` answer */
    currency?: string;

    shouldSaveDraft?: boolean;
};

function DynamicFormFields({fields, values, currency, shouldSaveDraft = true}: DynamicFormFieldsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <>
            {fields
                .filter((field) => isFieldVisible(field, values))
                .map((field) => {
                    const {InputComponent, inputProps, isMenuRow, shouldRenderLabelAbove} = getInputComponentForField(field, {values, translate, currency});
                    const label = getFieldLabel(field, translate);
                    return (
                        <View
                            key={field.key}
                            style={isMenuRow ? [styles.mhn5, styles.pv1] : styles.pv2}
                        >
                            {!!shouldRenderLabelAbove && <Text style={[styles.textLabelSupporting, styles.mb2, isMenuRow && styles.ph5]}>{label}</Text>}
                            <InputWrapper
                                InputComponent={InputComponent}
                                inputID={field.key}
                                label={label}
                                shouldSaveDraft={shouldSaveDraft}
                                forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                                {...inputProps}
                            />
                        </View>
                    );
                })}
        </>
    );
}

export default DynamicFormFields;
export type {DynamicFormFieldsProps};
