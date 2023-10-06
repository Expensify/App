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
import StepScreenWrapper from './StepScreenWrapper';

const propTypes = {};

const defaultProps = {};

function IOURequestStepAmount() {
    const {
        route: {
            params: {iouType, reportID, step, transactionID},
        },
        report,
        transaction,
        transaction: {currency},
    } = useContext(IOURouteContext);
    const {translate} = useLocalize();
    const textInput = useRef(null);
    const focusTimeoutRef = useRef(null);

    // console.log(transaction);
    // const currentCurrency = lodashGet(route, 'params.currency', '');
    // const currency = CurrencyUtils.isValidCurrencyCode(currentCurrency) ? currentCurrency : transaction.currency;

    // When this screen is accessed from the "start request flow" (ie. the manual/scan/distance tab selector) it is already embedded in a screen wrapper.
    // When this screen is navigated to from the "confirmation step" it won't be embedded in a screen wrapper, so the StepScreenWrapper should be shown.
    // In the "start request flow", the "step" param does not exist, but it does exist in the "confirmation step" flow.
    const isUserComingFromConfirmationStep = !_.isUndefined(step);

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
        // TODO: Figure out navigation
        // // Remove query from the route and encode it.
        // const activeRoute = encodeURIComponent(Navigation.getActiveRoute().replace(/\?.*/, ''));
        // Navigation.navigate(ROUTES.MONEY_REQUEST_CURRENCY.getRoute(iouType, reportID, currency, activeRoute));
        const backTo = ROUTES.MONEE_REQUEST_CREATE_TAB_MANUAL.getRoute(iouType, transactionID, reportID);
        Navigation.navigate(ROUTES.MONEE_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.CURRENCY, transactionID, reportID, '', backTo));
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
        <StepScreenWrapper
            headerTitle={translate('iou.amount')}
            onBackButtonPress={navigateBack}
            testID={IOURequestStepAmount.displayName}
            shouldShowNotFound={!IOUUtils.isValidMoneyRequestType(iouType)}
            shouldShowWrapper={isUserComingFromConfirmationStep}
        >
            <MoneyRequestAmountForm
                // TODO: Figure out this setting
                // isEditing={isEditing}
                currency={currency}
                amount={transaction.amount}
                ref={(e) => (textInput.current = e)}
                onCurrencyButtonPress={navigateToCurrencySelectionPage}
                onSubmitButtonPress={navigateToNextPage}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepAmount.propTypes = propTypes;
IOURequestStepAmount.defaultProps = defaultProps;
IOURequestStepAmount.displayName = 'IOURequestStepAmount';

export default IOURequestStepAmount;
