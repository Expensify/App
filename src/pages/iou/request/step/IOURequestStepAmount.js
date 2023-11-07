import {useFocusEffect} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import React, {useCallback, useRef} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import MoneyRequestAmountForm from '@pages/iou/steps/MoneyRequestAmountForm';
import reportPropTypes from '@pages/reportPropTypes';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';
import StepScreenWrapper from './StepScreenWrapper';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,

    /* Onyx Props */
    /** The report that the transaction belongs to */
    report: reportPropTypes,

    /** The transaction object being modified in Onyx */
    transaction: transactionPropTypes,
};

const defaultProps = {
    report: {},
    transaction: {},
};

function IOURequestStepAmount({
    report,
    route: {
        params: {iouType, reportID, step, transactionID},
    },
    transaction,
    transaction: {currency},
}) {
    const {translate} = useLocalize();
    const textInput = useRef(null);
    const focusTimeoutRef = useRef(null);

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

    const navigateToConfirmationStep = () => {
        Navigation.navigate(ROUTES.MONEYTEMPORARYFORREFACTOR_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.CONFIRMATION, transactionID, reportID));
    };

    const navigateBack = () => {
        if (isUserComingFromConfirmationStep) {
            // Take the user back to the confirmation step
            navigateToConfirmationStep();
            return;
        }

        Navigation.goBack(ROUTES.HOME);
    };

    const navigateToCurrencySelectionPage = () => {
        const currentPath = Navigation.getActiveRoute().replace(/\?.*/, '');
        Navigation.navigate(ROUTES.MONEYTEMPORARYFORREFACTOR_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.CURRENCY, transactionID, reportID, '', currentPath));
    };

    /**
     * @param {Number} currentAmount
     */
    const navigateToNextPage = (currentAmount) => {
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToBackendAmount(Number.parseFloat(currentAmount));
        IOU.setMoneyRequestAmount_temporaryForRefactor(transactionID, amountInSmallestCurrencyUnits, currency || CONST.CURRENCY.USD);

        if (isUserComingFromConfirmationStep) {
            navigateToConfirmationStep();
            return;
        }

        // If a reportID exists in the report object, it's because the user started this flow from using the + button in the composer
        // inside a report. In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
        // to the confirm step.
        if (report.reportID) {
            IOU.autoAssignParticipants(transactionID, report);
            Navigation.navigate(ROUTES.MONEYTEMPORARYFORREFACTOR_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.CONFIRMATION, transactionID, reportID));
            return;
        }

        // If there was no reportID, then that means the user started this flow from the global + menu
        // and an optimistic reportID was generated. In that case, the next step is to select the participants for this request.
        Navigation.navigate(ROUTES.MONEYTEMPORARYFORREFACTOR_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.PARTICIPANTS, transactionID, reportID));
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.amount')}
            onBackButtonPress={navigateBack}
            testID={IOURequestStepAmount.displayName}
            shouldShowWrapper={isUserComingFromConfirmationStep}
        >
            <MoneyRequestAmountForm
                buttonTranslationText={isUserComingFromConfirmationStep ? 'common.save' : undefined}
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

export default withOnyx({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '0')}`,
    },
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${lodashGet(route, 'params.transactionID', '0')}`,
    },
})(IOURequestStepAmount);
