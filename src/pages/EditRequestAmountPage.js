import React, {useCallback, useRef} from 'react';
import {InteractionManager} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import PropTypes from 'prop-types';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import Navigation from '../libs/Navigation/Navigation';
import useLocalize from '../hooks/useLocalize';
import MoneyRequestAmountForm from './iou/steps/MoneyRequestAmountForm';
import ROUTES from '../ROUTES';

const propTypes = {
    /** Transaction default amount value */
    defaultAmount: PropTypes.number.isRequired,

    /** Transaction default currency value */
    defaultCurrency: PropTypes.string.isRequired,

    /** Callback to fire when the Save button is pressed  */
    onSubmit: PropTypes.func.isRequired,

    /** reportID for the transaction thread */
    reportID: PropTypes.string.isRequired,
};

function EditRequestAmountPage({defaultAmount, defaultCurrency, onSubmit, reportID}) {
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

    const navigateToCurrencySelectionPage = () => {
        // Remove query from the route and encode it.
        const activeRoute = encodeURIComponent(Navigation.getActiveRoute().replace(/\?.*/, ''));
        Navigation.navigate(ROUTES.getEditRequestCurrencyRoute(reportID, defaultCurrency, activeRoute));
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
        >
            <HeaderWithBackButton
                title={translate('iou.amount')}
                onBackButtonPress={Navigation.goBack}
            />
            <MoneyRequestAmountForm
                isEditing
                currency={defaultCurrency}
                amount={defaultAmount}
                ref={(e) => (textInput.current = e)}
                onCurrencyButtonPress={navigateToCurrencySelectionPage}
                onSubmitButtonPress={onSubmit}
            />
        </ScreenWrapper>
    );
}

EditRequestAmountPage.propTypes = propTypes;
EditRequestAmountPage.displayName = 'EditRequestAmountPage';

export default EditRequestAmountPage;
