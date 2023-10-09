import React from 'react';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import ROUTES from '../../../../ROUTES';
import Navigation from '../../../../libs/Navigation/Navigation';
import useLocalize from '../../../../hooks/useLocalize';
import CategoryPicker from '../../../../components/CategoryPicker';
import ONYXKEYS from '../../../../ONYXKEYS';
import * as IOU from '../../../../libs/actions/IOU';
import CONST from '../../../../CONST';
import transactionPropTypes from '../../../../components/transactionPropTypes';
import reportPropTypes from '../../../reportPropTypes';
import StepScreenWrapper from './StepScreenWrapper';
import * as IOUUtils from '../../../../libs/IOUUtils';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,

    /* Onyx Props */
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    transaction: transactionPropTypes,

    /** The report attached to the transaction */
    report: reportPropTypes,
};

const defaultProps = {
    report: {},
    transaction: {},
};

function IOURequestStepCategory({
    transaction,
    route: {
        params: {iouType, reportID, transactionID},
    },
    report,
}) {
    const {translate} = useLocalize();

    const navigateBack = () => {
        Navigation.goBack(ROUTES.MONEE_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.CONFIRMATION, transactionID, reportID), true);
    };

    /**
     * @param {Object} category
     * @param {String} category.searchText
     */
    const updateCategory = (category) => {
        IOU.setMoneeRequestCategory(transactionID, category.searchText);
        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.category')}
            onBackButtonPress={navigateBack}
            shouldShowNotFound={!IOUUtils.isValidMoneyRequestType(iouType)}
            shouldShowWrapper
            testID={IOURequestStepCategory.displayName}
        >
            <CategoryPicker
                selectedCategory={transaction.category}
                policyID={report.policyID}
                onSubmit={updateCategory}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepCategory.displayName = 'IOURequestStepCategory';
IOURequestStepCategory.propTypes = propTypes;
IOURequestStepCategory.defaultProps = defaultProps;

export default withOnyx({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID')}`,
    },
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(route, 'params.transactionID')}`,
    },
})(IOURequestStepCategory);
