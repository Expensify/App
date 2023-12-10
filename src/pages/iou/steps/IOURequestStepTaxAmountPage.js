import {useFocusEffect} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as IOUUtils from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {iouDefaultProps, iouPropTypes} from '@pages/iou/propTypes';
import useThemeStyles from '@styles/useThemeStyles';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import MoneyRequestAmountForm from './MoneyRequestAmountForm';

const propTypes = {
    /** React Navigation route */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The type of IOU report, i.e. bill, request, send */
            iouType: PropTypes.string,

            /** The report ID of the IOU */
            reportID: PropTypes.string,

            /** Selected currency from IOUCurrencySelection */
            currency: PropTypes.string,
        }),
    }).isRequired,

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: iouPropTypes,

    transactionsDraft: PropTypes.shape({
        taxAmount: PropTypes.number,
    }),
};

const defaultProps = {
    iou: iouDefaultProps,
    transactionsDraft: {
        taxAmount: null,
    },
};

function IOURequestStepTaxAmountPage({route, iou, transactionsDraft}) {
    const styles = useThemeStyles();
    const textInput = useRef(null);
    const isEditing = Navigation.getActiveRoute().includes('taxAmount');

    const iouType = lodashGet(route, 'params.iouType', '');
    const reportID = lodashGet(route, 'params.reportID', '');
    const currentCurrency = lodashGet(route, 'params.currency', '');
    const currency = CurrencyUtils.isValidCurrencyCode(currentCurrency) ? currentCurrency : iou.currency;

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

    const navigateBack = () => {
        Navigation.goBack(isEditing ? ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(iouType, reportID) : ROUTES.HOME);
    };

    const navigateToCurrencySelectionPage = () => {
        // If the money request being created is a distance request, don't allow the user to choose the currency.
        // Only USD is allowed for distance requests.
        // Remove query from the route and encode it.
        const activeRoute = encodeURIComponent(Navigation.getActiveRouteWithoutParams());
        Navigation.navigate(ROUTES.MONEY_REQUEST_CURRENCY.getRoute(iouType, reportID, currency, activeRoute));
    };

    const updateTaxAmount = (currentAmount) => {
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToBackendAmount(Number.parseFloat(currentAmount));
        IOU.setMoneyRequestTaxAmount(iou.transactionID, amountInSmallestCurrencyUnits);
        IOU.setMoneyRequestCurrency(currency);
        Navigation.goBack(ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(iouType, reportID));
    };

    const content = (
        <MoneyRequestAmountForm
            isEditing={isEditing}
            currency={currency}
            amount={transactionsDraft.taxAmount}
            ref={(e) => (textInput.current = e)}
            onCurrencyButtonPress={navigateToCurrencySelectionPage}
            onSubmitButtonPress={updateTaxAmount}
        />
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            testID={IOURequestStepTaxAmountPage.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType)}>
                    <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                        <HeaderWithBackButton
                            title="Tax Amount"
                            onBackButtonPress={navigateBack}
                        />
                        {content}
                    </View>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

IOURequestStepTaxAmountPage.propTypes = propTypes;
IOURequestStepTaxAmountPage.defaultProps = defaultProps;
IOURequestStepTaxAmountPage.displayName = 'IOURequestStepTaxAmountPage';
export default compose(
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
    }),
    withOnyx({
        transactionsDraft: {
            key: ({iou}) => `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${iou.transactionID}`,
        },
    }),
)(IOURequestStepTaxAmountPage);
