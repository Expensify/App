import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import CategoryPicker from '@components/CategoryPicker';
import categoryPropTypes from '@components/categoryPropTypes';
import tagPropTypes from '@components/tagPropTypes';
import Text from '@components/Text';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import reportPropTypes from '@pages/reportPropTypes';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {policyPropTypes} from '@src/pages/workspace/withPolicy';
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

    /** The draft transaction that holds data to be persisted on the current transaction */
    splitDraftTransaction: transactionPropTypes,

    /** The report attached to the transaction */
    report: reportPropTypes,

    /** The policy of the report */
    policy: policyPropTypes.policy,

    /** Collection of categories attached to a policy */
    policyCategories: PropTypes.objectOf(categoryPropTypes),

    /** Collection of tags attached to a policy */
    policyTags: tagPropTypes,
};

const defaultProps = {
    report: {},
    transaction: {},
    splitDraftTransaction: {},
    policy: null,
    policyTags: null,
    policyCategories: null,
};

function IOURequestStepCategory({
    report,
    route: {
        params: {transactionID, backTo, action, iouType},
    },
    transaction,
    splitDraftTransaction,
    policy,
    policyTags,
    policyCategories,
}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplitBill = isEditing && iouType === CONST.IOU.TYPE.SPLIT;
    const {category: transactionCategory} = ReportUtils.getTransactionDetails(isEditingSplitBill ? splitDraftTransaction : transaction);

    const isPolicyExpenseChat = ReportUtils.isGroupPolicy(report);
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = !isPolicyExpenseChat || (!transactionCategory && !OptionsListUtils.hasEnabledOptions(_.values(policyCategories)));

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

        // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
        if (isEditingSplitBill) {
            IOU.setDraftSplitTransaction(transaction.transactionID, {category: category.searchText});
            navigateBack();
            return;
        }

        if (isEditing) {
            IOU.updateMoneyRequestCategory(transaction.transactionID, report.reportID, updatedCategory, policy, policyTags, policyCategories);
            navigateBack();
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
            shouldShowNotFoundPage={shouldShowNotFoundPage}
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

export default compose(
    withWritableReportOrNotFound,
    withFullTransactionOrNotFound,
    withOnyx({
        splitDraftTransaction: {
            key: ({route}) => {
                const transactionID = lodashGet(route, 'params.transactionID', 0);
                return `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`;
            },
        },
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
        },
        policyCategories: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report ? report.policyID : '0'}`,
        },
        policyTags: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${report ? report.policyID : '0'}`,
        },
    }),
)(IOURequestStepCategory);
