// TODO: This file came from IOURequestStepAmount.js and we need to make sure all the changes to that page have been encorporated
import React, {useCallback, useContext, useEffect, useRef} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import ONYXKEYS from '../../../../ONYXKEYS';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';
import * as ReportUtils from '../../../../libs/ReportUtils';
import * as CurrencyUtils from '../../../../libs/CurrencyUtils';
import reportPropTypes from '../../../reportPropTypes';
import * as IOU from '../../../../libs/actions/IOU';
import useLocalize from '../../../../hooks/useLocalize';
import MoneyRequestAmountForm from '../../steps/MoneyRequestAmountForm';
import * as IOUUtils from '../../../../libs/IOUUtils';
import * as MoneyRequestUtils from '../../../../libs/MoneyRequestUtils';
import FullPageNotFoundView from '../../../../components/BlockingViews/FullPageNotFoundView';
import styles from '../../../../styles/styles';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import CONST from '../../../../CONST';
import transactionPropTypes from '../../../../components/transactionPropTypes';
import * as TransactionUtils from '../../../../libs/TransactionUtils';
import IOURouteContext from '../../IOURouteContext';

const propTypes = {};

const defaultProps = {};

function IOURequestStepAmount() {
    const {route, report, transaction} = useContext(IOURouteContext);
    const {
        params: {iouType, reportID},
    } = route;
    const {translate} = useLocalize();
    const textInput = useRef(null);

    const currentCurrency = lodashGet(route, 'params.currency', '');

    const currency = CurrencyUtils.isValidCurrencyCode(currentCurrency) ? currentCurrency : transaction.currency;

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

    // Check and dismiss modal
    useEffect(() => {
        if (!ReportUtils.shouldDisableWriteActions(report)) {
            return;
        }
        Navigation.dismissModal(reportID);
    }, [report, reportID]);

    const navigateBack = () => {
        // TODO: Figure out navigating back to the confirmation step
        // Navigation.goBack(isEditing ? ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(iouType, reportID) : ROUTES.HOME);
    };

    const navigateToCurrencySelectionPage = () => {
        // If the money request being created is a distance request, don't allow the user to choose the currency.
        // Only USD is allowed for distance requests.
        if (TransactionUtils.isDistanceRequest(transaction)) {
            return;
        }

        // TODO: Figure out navigation
        // // Remove query from the route and encode it.
        // const activeRoute = encodeURIComponent(Navigation.getActiveRoute().replace(/\?.*/, ''));
        // Navigation.navigate(ROUTES.MONEY_REQUEST_CURRENCY.getRoute(iouType, reportID, currency, activeRoute));
    };

    const navigateToNextPage = (currentAmount) => {
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToBackendAmount(Number.parseFloat(currentAmount));
        IOU.setMoneyRequestAmount(amountInSmallestCurrencyUnits);
        IOU.setMoneyRequestCurrency(currency);

        // TODO: Figure out navigation
        // if (isEditing) {
        //     Navigation.goBack(ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(iouType, reportID));
        //     return;
        // }

        // IOU.navigateToNextPage(iou, iouType, report);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            testID={IOURequestStepAmount.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType)}>
                    <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                        <HeaderWithBackButton
                            title={translate('iou.amount')}
                            onBackButtonPress={navigateBack}
                        />
                        <MoneyRequestAmountForm
                            // TODO: Figure out this setting
                            // isEditing={isEditing}
                            currency={currency}
                            amount={transaction.amount}
                            ref={(e) => (textInput.current = e)}
                            onCurrencyButtonPress={navigateToCurrencySelectionPage}
                            onSubmitButtonPress={navigateToNextPage}
                        />
                    </View>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

IOURequestStepAmount.propTypes = propTypes;
IOURequestStepAmount.defaultProps = defaultProps;
IOURequestStepAmount.displayName = 'IOURequestStepAmount';

export default IOURequestStepAmount;
