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
import compose from '../../../libs/compose';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as CurrencyUtils from '../../../libs/CurrencyUtils';
import CONST from '../../../CONST';
import reportPropTypes from '../../reportPropTypes';
import * as IOU from '../../../libs/actions/IOU';
import useLocalize from '../../../hooks/useLocalize';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../../../components/withCurrentUserPersonalDetails';
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

function NewRequestAmountPage({route, iou, report, currentUserPersonalDetails, errors}) {
    const {translate} = useLocalize();

    const prevMoneyRequestID = useRef(iou.id);
    const textInput = useRef(null);

    const iouType = lodashGet(route, 'params.iouType', '');
    const reportID = lodashGet(route, 'params.reportID', '');
    const isEditing = lodashGet(route, 'path', '').includes('amount');
    const currentCurrency = lodashGet(route, 'params.currency', '');

    const {amount, participants} = iou;
    const currency = currentCurrency || iou.currency;

    const title = {
        [CONST.IOU.MONEY_REQUEST_TYPE.REQUEST]: translate('iou.requestMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SEND]: translate('iou.sendMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SPLIT]: translate('iou.splitBill'),
    };

    const titleForStep = isEditing ? translate('iou.amount') : title[iouType];

    /**
     * Focus text input
     */
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
        if (!ReportUtils.shouldHideComposer(report, errors)) {
            return;
        }
        Navigation.dismissModal(reportID);
    }, [errors, report, reportID]);

    // Because we use Onyx to store iou info, when we try to make two different money requests from different tabs, it can result in many bugs.
    // This logic is added to prevent such bugs.
    useEffect(() => {
        if (isEditing) {
            if (prevMoneyRequestID.current !== iou.id) {
                // The ID is cleared on completing a request. In that case, we will do nothing.
                if (iou.id) {
                    Navigation.goBack(ROUTES.getMoneyRequestRoute(iouType, reportID), true);
                }
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
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToSmallestUnit(currency, Number.parseFloat(currentAmount));
        IOU.setMoneyRequestAmount(amountInSmallestCurrencyUnits);
        IOU.setMoneyRequestCurrency(currency);

        if (isEditing) {
            Navigation.goBack(ROUTES.getMoneyRequestConfirmationRoute(iouType, reportID));
            return;
        }

        const moneyRequestID = `${iouType}${reportID}`;
        const shouldReset = iou.id !== moneyRequestID;
        // If the money request ID in Onyx does not match the ID from params, we want to start a new request
        // with the ID from params. We need to clear the participants in case the new request is initiated from FAB.
        if (shouldReset) {
            IOU.setMoneyRequestId(moneyRequestID);
            IOU.setMoneyRequestDescription('');
            IOU.setMoneyRequestParticipants([]);
        }

        // If a request is initiated on a report, skip the participants selection step and navigate to the confirmation page.
        if (report.reportID) {
            // Reinitialize the participants when the money request ID in Onyx does not match the ID from params
            if (_.isEmpty(participants)) {
                const currentUserAccountID = currentUserPersonalDetails.accountID;
                const iouParticipants = ReportUtils.isPolicyExpenseChat(report)
                    ? [{reportID: report.reportID, isPolicyExpenseChat: true, selected: true}]
                    : _.chain(report.participantAccountIDs)
                          .filter((accountID) => currentUserAccountID !== accountID)
                          .map((accountID) => ({accountID, selected: true}))
                          .value();
                IOU.setMoneyRequestParticipants(iouParticipants);
            }
            Navigation.navigate(ROUTES.getMoneyRequestConfirmationRoute(iouType, reportID));
            return;
        }
        Navigation.navigate(ROUTES.getMoneyRequestParticipantsRoute(iouType));
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            onEntryTransitionEnd={focusTextInput}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType)}>
                    <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                        {isEditing && (
                            <HeaderWithBackButton
                                title={titleForStep}
                                onBackButonBackButtonPress={navigateBack}
                            />
                        )}
                        <MoneyRequestAmountForm
                            isEditing={isEditing}
                            currency={currency}
                            amount={amount}
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

NewRequestAmountPage.propTypes = propTypes;
NewRequestAmountPage.defaultProps = defaultProps;
NewRequestAmountPage.displayName = 'NewRequestAmountPage';

export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '')}`,
        },
    }),
)(NewRequestAmountPage);
