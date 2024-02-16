import React from 'react';
import CategoryPicker from '@components/CategoryPicker';
import Text from '@components/Text';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import reportPropTypes from '@pages/reportPropTypes';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

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
        params: {transactionID, backTo, action, iouType},
    },
    transaction,
}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    /**
     * @param {Object} category
     * @param {String} category.searchText
     */
    const updateCategory = (category) => {
        const isSelectedCategory = category.searchText === transaction.category;
        const updatedCategory = isSelectedCategory ? '' : category.searchText;

        // The case edit split bill
        if (isSplitBill && isEditing) {
            IOU.setDraftSplitTransaction(transaction.transactionID, {category: category.searchText});
            navigateBack();
            return;
        }
        // The casse edit request
        if (isEditing) {
            IOU.updateMoneyRequestCategory(transaction.transactionID, report.reportID, updatedCategory);
            Navigation.dismissModal();
            return;
        }
        IOU.setMoneyRequestCategory(transactionID, updatedCategory);
        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.category')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepCategory.displayName}
        >
            <Text style={[styles.ph5, styles.pv3]}>{translate('iou.categorySelection')}</Text>
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

export default compose(withWritableReportOrNotFound, withFullTransactionOrNotFound)(IOURequestStepCategory);
