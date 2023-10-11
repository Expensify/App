import React, {useCallback, useRef} from 'react';
import {InteractionManager} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import PropTypes from 'prop-types';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import useLocalize from '../hooks/useLocalize';
import MoneyRequestAmountForm from './iou/steps/MoneyRequestAmountForm';

const propTypes = {
    /** Transaction default amount value */
    defaultAmount: PropTypes.number.isRequired,

    /** Transaction default currency value */
    defaultCurrency: PropTypes.string.isRequired,

    /** Callback to fire when the Save button is pressed  */
    onSubmit: PropTypes.func.isRequired,

    /** Callback to fire when we press on the currency  */
    onNavigateToCurrency: PropTypes.func.isRequired,
};

function EditRequestAmountPage({defaultAmount, defaultCurrency, onNavigateToCurrency, onSubmit}) {
    const {translate} = useLocalize();
    const textInput = useRef(null);

    const focusTextInput = () => {
        // Component may not be initialized due to navigation transitions
        // Wait until interactions are complete before trying to focus
        InteractionManager.runAfterInteractions(() => {
            // Focus text input
            if (!textInput.current) {
                return;
            }
            textInput.current.focus();
        });
    };

    useFocusEffect(
        useCallback(() => {
            focusTextInput();
        }, []),
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={EditRequestAmountPage.displayName}
        >
            <HeaderWithBackButton title={translate('iou.amount')} />
            <MoneyRequestAmountForm
                isEditing
                currency={defaultCurrency}
                amount={defaultAmount}
                ref={(e) => (textInput.current = e)}
                onCurrencyButtonPress={onNavigateToCurrency}
                onSubmitButtonPress={onSubmit}
            />
        </ScreenWrapper>
    );
}

EditRequestAmountPage.propTypes = propTypes;
EditRequestAmountPage.displayName = 'EditRequestAmountPage';

export default EditRequestAmountPage;
