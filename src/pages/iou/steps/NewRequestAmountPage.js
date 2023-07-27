import React, {useEffect, useState, useRef, useCallback} from 'react';
import {View, InteractionManager} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import {useFocusEffect} from '@react-navigation/native';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import BigNumberPad from '../../../components/BigNumberPad';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import compose from '../../../libs/compose';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as IOUUtils from '../../../libs/IOUUtils';
import * as CurrencyUtils from '../../../libs/CurrencyUtils';
import Button from '../../../components/Button';
import CONST from '../../../CONST';
import * as DeviceCapabilities from '../../../libs/DeviceCapabilities';
import TextInputWithCurrencySymbol from '../../../components/TextInputWithCurrencySymbol';
import ScreenWrapper from '../../../components/ScreenWrapper';
import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import reportPropTypes from '../../reportPropTypes';
import * as IOU from '../../../libs/actions/IOU';
import useLocalize from '../../../hooks/useLocalize';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../../../components/withCurrentUserPersonalDetails';
import MoneyRequestAmountForm from './MoneyRequestAmountForm';

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

    ...withCurrentUserPersonalDetailsPropTypes,
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
        currency: CONST.CURRENCY.USD,
        participants: [],
    },
    ...withCurrentUserPersonalDetailsDefaultProps,
};

const amountViewID = 'amountView';
const numPadContainerViewID = 'numPadContainerView';
const numPadViewID = 'numPadView';


function MoneyRequestAmountPage(props) {
    const { translate } = useLocalize();
    const selectedAmountAsString = props.iou.amount ? CurrencyUtils.convertToWholeUnit(props.iou.currency, props.iou.amount).toString() : '';

    console.log('newshit');

    const prevMoneyRequestID = useRef(props.iou.id);
    const textInput = useRef(null);
    const iouType = useRef(lodashGet(props.route, 'params.iouType', ''));
    const reportID = useRef(lodashGet(props.route, 'params.reportID', ''));
    const isEditing = useRef(lodashGet(props.route, 'path', '').includes('amount'));

    const [amount, setAmount] = useState(selectedAmountAsString);
    const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(props.iou.currency);
    const [selection, setSelection] = useState({
        start: selectedAmountAsString.length,
        end: selectedAmountAsString.length,
    });

    const title = {
        [CONST.IOU.MONEY_REQUEST_TYPE.REQUEST]: translate('iou.requestMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SEND]: translate('iou.sendMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SPLIT]: translate('iou.splitBill'),
    };
    const titleForStep = isEditing.current ? translate('iou.amount') : title[iouType.current];

    /**
     * Check and dismiss modal
     */
    useEffect(() => {
        if (!ReportUtils.shouldHideComposer(props.report, props.errors)) {
            return;
        }
        Navigation.dismissModal(reportID.current);
    }, [props.errors, props.report]);

    /**
     * Focus text input
     */
    const focusTextInput = () => {
        // Component may not initialized due to navigation transitions
        // Wait until interactions are complete before trying to focus
        InteractionManager.runAfterInteractions(() => {
            // Focus text input
            if (!textInput.current) {
                return;
            }

            textInput.current.focus();
        });
    };

    /**
     * Convert amount to whole unit and update selection
     *
     * @param {String} currencyCode
     * @param {Number} amountInCurrencyUnits
     */
    const saveAmountToState = (currencyCode, amountInCurrencyUnits) => {
        if (!currencyCode || !amountInCurrencyUnits) {
            return;
        }
        const amountAsStringForState = CurrencyUtils.convertToWholeUnit(currencyCode, amountInCurrencyUnits).toString();
        setAmount(amountAsStringForState);
        setSelection({
            start: amountAsStringForState.length,
            end: amountAsStringForState.length,
        });
    };

    useEffect(() => {
        if (isEditing.current) {
            if (prevMoneyRequestID.current !== props.iou.id) {
                // The ID is cleared on completing a request. In that case, we will do nothing.
                if (props.iou.id) {
                    Navigation.goBack(ROUTES.getMoneyRequestRoute(iouType.current, reportID.current), true);
                }
                return;
            }
            const moneyRequestID = `${iouType.current}${reportID.current}`;
            const shouldReset = props.iou.id !== moneyRequestID;
            if (shouldReset) {
                IOU.resetMoneyRequestInfo(moneyRequestID);
            }

            if (_.isEmpty(props.iou.participants) || props.iou.amount === 0 || shouldReset) {
                Navigation.goBack(ROUTES.getMoneyRequestRoute(iouType.current, reportID.current), true);
            }
        }

        return () => {
            prevMoneyRequestID.current = props.iou.id;
        };
    }, [props.iou.participants, props.iou.amount, props.iou.id]);

    useEffect(() => {
        if (!props.route.params.currency) {
            return;
        }

        setSelectedCurrencyCode(props.route.params.currency);
    }, [props.route.params.currency]);

    useEffect(() => {
        setSelectedCurrencyCode(props.iou.currency);
    }, [props.iou.currency]);

    useEffect(() => {
        saveAmountToState(props.iou.currency, props.iou.amount);
    }, [props.iou.amount, props.iou.currency]);

    useFocusEffect(
        useCallback(() => {
            focusTextInput();
        }, []),
    );

    const navigateBack = () => {
        Navigation.goBack(isEditing.current ? ROUTES.getMoneyRequestConfirmationRoute(iouType.current, reportID.current) : null);
    };

    const navigateToCurrencySelectionPage = () => {
        // Remove query from the route and encode it.
        const activeRoute = encodeURIComponent(Navigation.getActiveRoute().replace(/\?.*/, ''));
        Navigation.navigate(ROUTES.getMoneyRequestCurrencyRoute(iouType.current, reportID.current, selectedCurrencyCode, activeRoute));
    };

    const navigateToNextPage = () => {
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToSmallestUnit(selectedCurrencyCode, Number.parseFloat(amount));
        IOU.setMoneyRequestAmount(amountInSmallestCurrencyUnits);
        IOU.setMoneyRequestCurrency(selectedCurrencyCode);

        saveAmountToState(selectedCurrencyCode, amountInSmallestCurrencyUnits);

        if (isEditing.current) {
            Navigation.goBack(ROUTES.getMoneyRequestConfirmationRoute(iouType.current, reportID.current));
            return;
        }

        const moneyRequestID = `${iouType.current}${reportID.current}`;
        const shouldReset = props.iou.id !== moneyRequestID;
        // If the money request ID in Onyx does not match the ID from params, we want to start a new request
        // with the ID from params. We need to clear the participants in case the new request is initiated from FAB.
        if (shouldReset) {
            IOU.setMoneyRequestId(moneyRequestID);
            IOU.setMoneyRequestDescription('');
            IOU.setMoneyRequestParticipants([]);
        }

        // If a request is initiated on a report, skip the participants selection step and navigate to the confirmation page.
        if (props.report.reportID) {
            // Reinitialize the participants when the money request ID in Onyx does not match the ID from params
            if (_.isEmpty(props.iou.participants) || shouldReset) {
                const currentUserAccountID = props.currentUserPersonalDetails.accountID;
                const participants = ReportUtils.isPolicyExpenseChat(props.report)
                    ? [{reportID: props.report.reportID, isPolicyExpenseChat: true, selected: true}]
                    : _.chain(props.report.participantAccountIDs)
                          .filter((accountID) => currentUserAccountID !== accountID)
                          .map((accountID) => ({accountID, selected: true}))
                          .value();
                IOU.setMoneyRequestParticipants(participants);
            }
            Navigation.navigate(ROUTES.getMoneyRequestConfirmationRoute(iouType.current, reportID.current));
            return;
        }
        Navigation.navigate(ROUTES.getMoneyRequestParticipantsRoute(iouType.current));
    };

    return (
        <MoneyRequestAmountForm
            report={props.report}
            iou={props.iou}
            reportID={reportID.current}
            iouType={iouType.current}
            title={title}
            navigateBack={navigateBack}
            navigateToCurrencySelectionPage={navigateToCurrencySelectionPage}
            route={props.route}
            navigateToNextPage={navigateToNextPage}
            currentUserPersonalDetails={props.currentUserPersonalDetails}
        />
    );
}

MoneyRequestAmountPage.propTypes = propTypes;
MoneyRequestAmountPage.defaultProps = defaultProps;
MoneyRequestAmountPage.displayName = 'MoneyRequestAmountPage';

export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '')}`,
        },
    }),
)(MoneyRequestAmountPage);
