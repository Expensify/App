import lodashGet from 'lodash/get';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import CategoryPicker from '@components/CategoryPicker';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
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
    report,
    route: {
        params: {iouType, reportID, transactionID},
    },
    transaction,
}) {
    const {translate} = useLocalize();

    const navigateBack = () => {
        Navigation.goBack(ROUTES.MONEYTEMPORARYFORREFACTOR_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.CONFIRMATION, transactionID, reportID), true);
    };

    /**
     * @param {Object} category
     * @param {String} category.searchText
     */
    const updateCategory = (category) => {
        IOU.setMoneeRequestCategory_temporaryForRefactor(transactionID, category.searchText);
        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.category')}
            onBackButtonPress={navigateBack}
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
