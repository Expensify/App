import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect} from 'react';
import {Keyboard} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import CurrencySelectionList from '@components/CurrencySelectionList';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {withNetwork} from '@components/OnyxProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {iouDefaultProps, iouPropTypes} from './propTypes';

/**
 * IOU Currency selection for selecting currency
 */
const propTypes = {
    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The type of IOU report, i.e. bill, request, send */
            iouType: PropTypes.string,

            /** The report ID of the IOU */
            reportID: PropTypes.string,

            /** Currently selected currency */
            currency: PropTypes.string,

            /** Route to navigate back after selecting a currency */
            backTo: PropTypes.string,
        }),
    }).isRequired,

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: iouPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    iou: iouDefaultProps,
};

function IOUCurrencySelection(props) {
    const selectedCurrencyCode = (lodashGet(props.route, 'params.currency', props.iou.currency) || CONST.CURRENCY.USD).toUpperCase();
    const iouType = lodashGet(props.route, 'params.iouType', CONST.IOU.TYPE.REQUEST);
    const reportID = lodashGet(props.route, 'params.reportID', '');
    const threadReportID = lodashGet(props.route, 'params.threadReportID', '');

    // Decides whether to allow or disallow editing a money request
    useEffect(() => {
        // Do not dismiss the modal, when it is not the edit flow.
        if (!threadReportID) {
            return;
        }

        const report = ReportUtils.getReport(threadReportID);
        const parentReportAction = ReportActionsUtils.getReportAction(report.parentReportID, report.parentReportActionID);

        // Do not dismiss the modal, when a current user can edit this currency of this money request.
        if (ReportUtils.canEditFieldOfMoneyRequest(parentReportAction, report.parentReportID, CONST.EDIT_REQUEST_FIELD.CURRENCY)) {
            return;
        }

        // Dismiss the modal when a current user cannot edit a money request.
        Navigation.isNavigationReady().then(() => {
            Navigation.dismissModal();
        });
    }, [threadReportID]);

    const confirmCurrencySelection = useCallback(
        (option) => {
            const backTo = lodashGet(props.route, 'params.backTo', '');
            Keyboard.dismiss();

            // When we refresh the web, the money request route gets cleared from the navigation stack.
            // Navigating to "backTo" will result in forward navigation instead, causing disruption to the currency selection.
            // To prevent any negative experience, we have made the decision to simply close the currency selection page.
            if (_.isEmpty(backTo) || props.navigation.getState().routes.length === 1) {
                Navigation.goBack(ROUTES.HOME);
            } else {
                Navigation.navigate(`${props.route.params.backTo}?currency=${option.currencyCode}`);
            }
        },
        [props.route, props.navigation],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={IOUCurrencySelection.displayName}
        >
            <HeaderWithBackButton
                title={props.translate('common.selectCurrency')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.MONEY_REQUEST.getRoute(iouType, reportID))}
            />
            <CurrencySelectionList
                textInputLabel={props.translate('common.search')}
                onSelect={confirmCurrencySelection}
                initiallyFocusedCurrencyCode={selectedCurrencyCode}
                initiallySelectedCurrencyCode={selectedCurrencyCode}
            />
        </ScreenWrapper>
    );
}

IOUCurrencySelection.displayName = 'IOUCurrencySelection';
IOUCurrencySelection.propTypes = propTypes;
IOUCurrencySelection.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
    }),
    withNetwork(),
)(IOUCurrencySelection);
