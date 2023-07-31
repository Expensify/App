import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
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
import MoneyRequestAmountForm from './MoneyRequestAmountForm/MoneyRequestAmountForm';
import * as IOUUtils from '../../../libs/IOUUtils';
import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';

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

function NewRequestAmountPage({route, report, iou, currentUserPersonalDetails}) {
    const {translate} = useLocalize();

    const iouType = lodashGet(route, 'params.iouType', '');
    const reportID = lodashGet(route, 'params.reportID', '');
    const isEditing = lodashGet(route, 'path', '').includes('amount');
    const currentCurrency = lodashGet(route, 'params.currency', '');

    const {amount} = iou;
    const currency = currentCurrency || iou.currency;

    const title = {
        [CONST.IOU.MONEY_REQUEST_TYPE.REQUEST]: translate('iou.requestMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SEND]: translate('iou.sendMoney'),
        [CONST.IOU.MONEY_REQUEST_TYPE.SPLIT]: translate('iou.splitBill'),
    };

    const titleForStep = isEditing ? translate('iou.amount') : title[iouType];

    const navigateBack = () => {
        Navigation.goBack(isEditing.current ? ROUTES.getMoneyRequestConfirmationRoute(iouType, reportID) : null);
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

        // If a request is initiated on a report, skip the participants selection step and navigate to the confirmation page.
        if (report.reportID) {
            // Reinitialize the participants when the money request ID in Onyx does not match the ID from params
            if (_.isEmpty(iou.participants)) {
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
        <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType)}>
            <MoneyRequestAmountForm
                title={titleForStep}
                isEditing={isEditing}
                currency={currency}
                amount={amount}
                onBackButtonPress={navigateBack}
                onCurrencyButtonPress={navigateToCurrencySelectionPage}
                onSubmitButtonPress={navigateToNextPage}
            />
        </FullPageNotFoundView>
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
