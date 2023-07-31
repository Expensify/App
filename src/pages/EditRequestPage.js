import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import CONST from '../CONST';
import Navigation from '../libs/Navigation/Navigation';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import ONYXKEYS from '../ONYXKEYS';
import * as ReportActionsUtils from '../libs/ReportActionsUtils';
import EditRequestDescriptionPage from './EditRequestDescriptionPage';
import reportPropTypes from './reportPropTypes';
import * as ReportUtils from '../libs/ReportUtils';

const propTypes = {
    ...withLocalizePropTypes,

    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** Which field we are editing */
            field: PropTypes.string,

            /** reportID for the "transaction thread" */
            threadReportID: PropTypes.string,
        }),
    }).isRequired,

    /** The report object for the thread report */
    report: reportPropTypes,
};

const defaultProps = {
    report: {},
};

function EditRequestPage(props) {
    const parentReportAction = ReportActionsUtils.getParentReportAction(props.report);
    const moneyRequestReportAction = ReportUtils.getMoneyRequestAction(parentReportAction);
    const transactionDescription = moneyRequestReportAction.comment;
    const field = lodashGet(props, ['route', 'params', 'field'], '');

    function updateTransactionWithChanges(changes) {
        // Update the transaction...
        // eslint-disable-next-line no-console
        console.log({changes});

        // Note: The "modal" we are dismissing is the MoneyRequestAmountPage
        Navigation.dismissModal();
    }

    if (field === CONST.EDIT_REQUEST_FIELD.DESCRIPTION) {
        return (
            <EditRequestDescriptionPage
                defaultDescription={transactionDescription}
                onSubmit={(changes) => {
                    updateTransactionWithChanges(changes);
                }}
            />
        );
    }

    return null;
}

EditRequestPage.displayName = 'EditRequestPage';
EditRequestPage.propTypes = propTypes;
EditRequestPage.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withOnyx({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.threadReportID}`,
        },
    }),
)(EditRequestPage);
