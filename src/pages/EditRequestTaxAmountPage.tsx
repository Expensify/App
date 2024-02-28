import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import type {BaseTextInputRef} from '@src/components/TextInput/BaseTextInput/types';
import CONST from '@src/CONST';
import MoneyRequestAmountForm from './iou/steps/MoneyRequestAmountForm';

type EditRequestTaxAmountPageProps = {
    /** Transaction default amount value */
    defaultAmount: number;

    /** Transaction default tax amount value */
    defaultTaxAmount: number;

    /** Transaction default currency value */
    defaultCurrency: string;

    /** Callback to fire when the Save button is pressed  */
    onSubmit: () => void;

    /** Callback to fire when we press on the currency  */
    onNavigateToCurrency: () => void;
};

function EditRequestTaxAmountPage({defaultAmount, defaultTaxAmount, defaultCurrency, onNavigateToCurrency, onSubmit}: EditRequestTaxAmountPageProps) {
    const {translate} = useLocalize();
    const textInput = useRef<BaseTextInputRef>(null);

    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => textInput.current && textInput.current.focus(), CONST.ANIMATED_TRANSITION);
            return () => {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, []),
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            shouldEnableMinHeight={DeviceCapabilities.canUseTouchScreen()}
            testID={EditRequestTaxAmountPage.displayName}
        >
            <HeaderWithBackButton title={translate('iou.taxAmount')} />
            <MoneyRequestAmountForm
                currency={defaultCurrency}
                amount={defaultAmount}
                taxAmount={defaultTaxAmount}
                ref={textInput}
                isCurrencyPressable={false}
                onCurrencyButtonPress={onNavigateToCurrency}
                onSubmitButtonPress={onSubmit}
                isEditing
            />
        </ScreenWrapper>
    );
}

EditRequestTaxAmountPage.displayName = 'EditRequestTaxAmountPage';

export default EditRequestTaxAmountPage;
