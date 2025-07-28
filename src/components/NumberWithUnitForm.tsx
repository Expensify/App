import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef} from 'react';
import MoneyRequestAmountForm from '@pages/iou/MoneyRequestAmountForm';
import type {MoneyRequestAmountFormProps} from '@pages/iou/MoneyRequestAmountForm';
import CONST from '@src/CONST';
import type {BaseTextInputRef} from './TextInput/BaseTextInput/types';

type NumberWithUnitFormProps = Omit<MoneyRequestAmountFormProps, 'currency'> & {
    unit?: string;
};

function NumberWithUnitForm({
    amount = 0,
    unit = CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
    isEditing = false,
    skipConfirmation = false,
    iouType = CONST.IOU.TYPE.SUBMIT,
    policyID = '',
    onSubmitButtonPress,
    selectedTab = CONST.TAB_REQUEST.MANUAL,
    decimals,
}: NumberWithUnitFormProps) {
    const textInput = useRef<BaseTextInputRef | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => textInput.current?.focus(), CONST.ANIMATED_TRANSITION);
            return () => {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, []),
    );

    return (
        <MoneyRequestAmountForm
            amount={amount}
            decimals={decimals}
            unit={unit}
            hideCurrencySymbol
            iouType={iouType}
            policyID={policyID}
            isEditing={isEditing}
            skipConfirmation={skipConfirmation}
            onSubmitButtonPress={onSubmitButtonPress}
            selectedTab={selectedTab}
            shouldKeepUserInput
            ref={(e) => {
                textInput.current = e;
            }}
        />
    );
}

NumberWithUnitForm.displayName = 'NumberWithUnitForm';
export default NumberWithUnitForm;
export type {NumberWithUnitFormProps};
