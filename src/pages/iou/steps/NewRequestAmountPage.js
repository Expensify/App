import React, {useCallback, useEffect, useRef} from 'react';
import {InteractionManager, View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {useFocusEffect} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import ONYXKEYS from '../../../ONYXKEYS';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as CurrencyUtils from '../../../libs/CurrencyUtils';
import CONST from '../../../CONST';
import reportPropTypes from '../../reportPropTypes';
import * as IOU from '../../../libs/actions/IOU';
import useLocalize from '../../../hooks/useLocalize';
import MoneyRequestAmountForm from './MoneyRequestAmountForm';
import * as IOUUtils from '../../../libs/IOUUtils';
import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';
import styles from '../../../styles/styles';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../components/ScreenWrapper';

const propTypes = {
    route: PropTypes.shape({
        params: PropTypes.shape({
            iouType: PropTypes.string,
            reportID: PropTypes.string,
        }),
    }),

    /** The report on which the request is initiated on */
    report: reportPropTypes,

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: PropTypes.shape({
        id: PropTypes.string,
        amount: PropTypes.number,
        currency: PropTypes.string,
        merchant: PropTypes.string,
        created: PropTypes.string,
        participants: PropTypes.arrayOf(
            PropTypes.shape({
                accountID: PropTypes.number,
                login: PropTypes.string,
                isPolicyExpenseChat: PropTypes.bool,
                isOwnPolicyExpenseChat: PropTypes.bool,
                selected: PropTypes.bool,
            }),
        ),
    }),
};

const defaultProps = {
    route: {
        params: {
            iouType: '',
            reportID: '',
        },
    },
    report: {},
    iou: {
        id: '',
        amount: 0,
        created: '',
        merchant: '',
        currency: CONST.CURRENCY.USD,
        participants: [],
    },
};

function NewRequestAmountPage({route, iou, report}) {
    const {translate} = useLocalize();

    const prevMoneyRequestID = useRef(iou.id);
    const textInput = useRef(null);

    const iouType = lodashGet(route, 'params.iouType', '');
    const reportID = lodashGet(route, 'params.reportID', '');
    const isEditing = lodashGet(route, 'path', '').includes('amount');
    const currentCurrency = lodashGet(route, 'params.currency', '');

    const currency = currentCurrency || iou.currency;

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

    // Check and dismiss modal
    useEffect(() => {
        if (!ReportUtils.shouldDisableWriteActions(report)) {
            return;
        }
        Navigation.dismissModal(reportID);
    }, [report, reportID]);

    // Because we use Onyx to store IOU info, when we try to make two different money requests from different tabs,
    // it can result in an IOU sent with improper values. In such cases we want to reset the flow and redirect the user to the first step of the IOU.
    useEffect(() => {
        if (isEditing) {
            // ID in Onyx could change by initiating a new request in a separate browser tab or completing a request
            if (prevMoneyRequestID.current !== iou.id) {
                // The ID is cleared on completing a request. In that case, we will do nothing.
                if (!iou.id) {
                    return;
                }
                Navigation.goBack(ROUTES.getMoneyRequestRoute(iouType, reportID), true);
                return;
            }
            const moneyRequestID = `${iouType}${reportID}`;
            const shouldReset = iou.id !== moneyRequestID;
            if (shouldReset) {
                IOU.resetMoneyRequestInfo(moneyRequestID);
            }

            if (_.isEmpty(iou.participants) || iou.amount === 0 || shouldReset) {
                Navigation.goBack(ROUTES.getMoneyRequestRoute(iouType, reportID), true);
            }
        }

        return () => {
            prevMoneyRequestID.current = iou.id;
        };
    }, [iou.participants, iou.amount, iou.id, isEditing, iouType, reportID]);

    const navigateBack = () => {
        Navigation.goBack(isEditing ? ROUTES.getMoneyRequestConfirmationRoute(iouType, reportID) : null);
    };

    const navigateToCurrencySelectionPage = () => {
        // Remove query from the route and encode it.
        const activeRoute = encodeURIComponent(Navigation.getActiveRoute().replace(/\?.*/, ''));
        Navigation.navigate(ROUTES.getMoneyRequestCurrencyRoute(iouType, reportID, currency, activeRoute));
    };

    const navigateToNextPage = (currentAmount) => {
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToBackendAmount(Number.parseFloat(currentAmount));
        IOU.setMoneyRequestAmount(amountInSmallestCurrencyUnits);
        IOU.setMoneyRequestCurrency(currency);

        if (isEditing) {
            Navigation.goBack(ROUTES.getMoneyRequestConfirmationRoute(iouType, reportID));
            return;
        }

        IOU.navigateToNextPage(iou, iouType, reportID, report);
    };

    const content = (
        <MoneyRequestAmountForm
            isEditing={isEditing}
            currency={currency}
            amount={iou.amount}
            ref={(e) => (textInput.current = e)}
            onCurrencyButtonPress={navigateToCurrencySelectionPage}
            onSubmitButtonPress={navigateToNextPage}
        />
    );

    // ScreenWrapper is only needed in edit mode because we have a dedicated route for the edit amount page (MoneyRequestEditAmountPage).
    // The rest of the cases this component is rendered through <MoneyRequestSelectorPage /> which has it's own ScreenWrapper
    if (!isEditing) {
        return content;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            onEntryTransitionEnd={focusTextInput}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType)}>
                    <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                        <HeaderWithBackButton
                            title={translate('iou.amount')}
                            onBackButonBackButtonPress={navigateBack}
                        />
                        {content}
                    </View>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

NewRequestAmountPage.propTypes = propTypes;
NewRequestAmountPage.defaultProps = defaultProps;
NewRequestAmountPage.displayName = 'NewRequestAmountPage';

export default withOnyx({
    iou: {key: ONYXKEYS.IOU},
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '')}`,
    },
})(NewRequestAmountPage);
