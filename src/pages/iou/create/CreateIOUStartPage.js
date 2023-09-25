import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import compose from '../../../libs/compose';
import CONST from '../../../CONST';
import Navigation from '../../../libs/Navigation/Navigation';
import ONYXKEYS from '../../../ONYXKEYS';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as TransactionUtils from '../../../libs/TransactionUtils';
import * as Policy from '../../../libs/actions/Policy';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes} from '../../../components/withCurrentUserPersonalDetails';
import EditRequestDescriptionPage from '../../EditRequestDescriptionPage';
import EditRequestMerchantPage from '../../EditRequestMerchantPage';
import EditRequestCreatedPage from '../../EditRequestCreatedPage';
import EditRequestAmountPage from '../../EditRequestAmountPage';
import EditRequestReceiptPage from '../../EditRequestReceiptPage';
import reportPropTypes from '../../reportPropTypes';
import * as IOU from '../../../libs/actions/IOU';
import * as CurrencyUtils from '../../../libs/CurrencyUtils';
import EditRequestDistancePage from '../../EditRequestDistancePage';
import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';
import EditRequestCategoryPage from '../../EditRequestCategoryPage';

const propTypes = {
    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The type of IOU being created */
            iouType: PropTypes.oneOf(_.values(CONST.IOU.MONEY_REQUEST_TYPE)).isRequired,

            /** The optimistic ID of a new transaction that is being created */
            transactionID: PropTypes.string.isRequired,

            /** reportID if a transaction is attached to a specific report */
            reportID: PropTypes.string,
        }),
    }).isRequired,
};

const defaultProps = {};

function CreateIOUStartPage() {
    // Show the tab selector for switching transaction type
    return <FullPageNotFoundView shouldShow />;
}

CreateIOUStartPage.displayName = 'CreateIOUStartPage';
CreateIOUStartPage.propTypes = propTypes;
CreateIOUStartPage.defaultProps = defaultProps;
export default CreateIOUStartPage;
