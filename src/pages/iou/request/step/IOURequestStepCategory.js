import React from 'react';
import _ from 'underscore';
import CategoryPicker from '@components/CategoryPicker';
import Text from '@components/Text';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import reportPropTypes from '@pages/reportPropTypes';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
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

    /** The draft transaction of scan split bill */
    splitTransactionDraft: transactionPropTypes,

    /** The report attached to the transaction */
    report: reportPropTypes,
};

const defaultProps = {
    report: {},
    transaction: {},
    splitTransactionDraft: {},
};

function IOURequestStepCategory({
    report,
    route: {
        params: {transactionID, backTo, action, iouType},
    },
    transaction,
    splitTransactionDraft,
}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {category: transactionCategory} = ReportUtils.getTransactionDetails(_.isEmpty(splitTransactionDraft) ? transaction : splitTransactionDraft);
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
        const isSelectedCategory = category.searchText === transactionCategory;
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
                selectedCategory={transactionCategory}
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
