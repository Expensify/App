import {useFocusEffect} from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, {useCallback, useRef} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import MoneyRequestAmountForm from './iou/steps/MoneyRequestAmountForm';

const propTypes = {
    /** Transaction default amount value */
    defaultAmount: PropTypes.number.isRequired,

    /** Transaction default tax amount value */
    defaultTaxAmount: PropTypes.number.isRequired,

    /** Transaction default currency value */
    defaultCurrency: PropTypes.string.isRequired,

    /** Callback to fire when the Save button is pressed  */
    onSubmit: PropTypes.func.isRequired,

    /** Callback to fire when we press on the currency  */
    onNavigateToCurrency: PropTypes.func.isRequired,
};

function EditRequestTaxAmountPage({defaultAmount, defaultTaxAmount, defaultCurrency, onNavigateToCurrency, onSubmit}) {
    const {translate} = useLocalize();
    const textInput = useRef(null);

    const focusTimeoutRef = useRef(null);

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
                ref={(e) => (textInput.current = e)}
                onCurrencyButtonPress={onNavigateToCurrency}
                onSubmitButtonPress={onSubmit}
                isEditing
            />
        </ScreenWrapper>
    );
}

EditRequestTaxAmountPage.propTypes = propTypes;
EditRequestTaxAmountPage.displayName = 'EditRequestTaxAmountPage';

export default EditRequestTaxAmountPage;
