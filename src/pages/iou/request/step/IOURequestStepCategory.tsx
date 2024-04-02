import type {StackScreenProps} from '@react-navigation/stack';
import lodashIsEmpty from 'lodash/isEmpty';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import CategoryPicker from '@components/CategoryPicker';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Policy, PolicyCategories, PolicyTagList, ReportActions, Session, Transaction} from '@src/types/onyx';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepCategoryStackProps = {stackProps: StackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.STEP_CATEGORY>};

type IOURequestStepCategoryOnyxProps = {
    /** The draft transaction that holds data to be persisted on the current transaction */
    splitDraftTransaction: OnyxEntry<Transaction>;
    /** The policy of the report */
    policy: OnyxEntry<Policy>;
    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<PolicyCategories>;
    /** Collection of tags attached to a policy */
    policyTags: OnyxEntry<PolicyTagList>;
    /** The actions from the parent report */
    reportActions: OnyxEntry<ReportActions>;
    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};

type IOURequestStepCategoryProps = IOURequestStepCategoryStackProps &
    IOURequestStepCategoryOnyxProps &
    WithWritableReportOrNotFoundProps & {
        /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
        transaction: OnyxEntry<Transaction>;
    };

function IOURequestStepCategory({
    report,
    stackProps: {
        route: {
            params: {transactionID, backTo, action, iouType, reportActionID},
        },
    },
    transaction,
    splitDraftTransaction,
    policy,
    policyTags,
    policyCategories,
    reportActions,
    session,
}: IOURequestStepCategoryProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplitBill = isEditing && iouType === CONST.IOU.TYPE.SPLIT;
    const transactionCategory = ReportUtils.getTransactionDetails(isEditingSplitBill && !lodashIsEmpty(splitDraftTransaction) ? splitDraftTransaction : transaction)?.category;

    const reportAction = reportActions?.[report?.parentReportActionID ?? reportActionID] ?? null;
    const shouldShowCategory = ReportUtils.isGroupPolicy(report) && (transactionCategory ?? OptionsListUtils.hasEnabledOptions(Object.values(policyCategories ?? {})));
    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;
    const canEditSplitBill = isSplitBill && reportAction && session?.accountID === reportAction.actorAccountID && TransactionUtils.areRequiredFieldsEmpty(transaction);
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = !shouldShowCategory || (isEditing && (isSplitBill ? !canEditSplitBill : !ReportUtils.canEditMoneyRequest(reportAction)));

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const updateCategory = (category: ListItem) => {
        const categorySearchText = category.searchText ?? '';
        const isSelectedCategory = categorySearchText === transactionCategory;
        const updatedCategory = isSelectedCategory ? '' : categorySearchText;

        if (transaction) {
            // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
            if (isEditingSplitBill) {
                IOU.setDraftSplitTransaction(transaction.transactionID, {category: updatedCategory});
                navigateBack();
                return;
            }

            if (isEditing && report) {
                IOU.updateMoneyRequestCategory(transaction.transactionID, report.reportID, updatedCategory, policy, policyTags, policyCategories);
                navigateBack();
                return;
            }
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
            includeSafeAreaPaddingBottom={false}
        >
            <Text style={[styles.ph5, styles.pv3]}>{translate('iou.categorySelection')}</Text>
            <CategoryPicker
                selectedCategory={transactionCategory}
                policyID={report?.policyID ?? ''}
                onSubmit={updateCategory}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepCategory.displayName = 'IOURequestStepCategory';

/* eslint-disable rulesdir/no-negated-variables */
const IOURequestStepCategoryWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepCategory);
/* eslint-disable rulesdir/no-negated-variables */
const IOURequestStepCategoryWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepCategoryWithWritableReportOrNotFound);
export default withOnyx<IOURequestStepCategoryProps, IOURequestStepCategoryOnyxProps>({
    splitDraftTransaction: {
        key: ({route}) => {
            const transactionID = route?.params.transactionID ?? 0;
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
    reportActions: {
        key: ({
            report,
            route: {
                params: {action, iouType},
            },
        }) => {
            let reportID = '0';
            if (action === CONST.IOU.ACTION.EDIT && report) {
                if (iouType === CONST.IOU.TYPE.SPLIT) {
                    reportID = report.reportID;
                } else if (report.parentReportID) {
                    reportID = report.parentReportID;
                }
            }
            return `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`;
        },
        canEvict: false,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
    // @ts-expect-error TODO: Remove this once withFullTransactionOrNotFound (https://github.com/Expensify/App/issues/36123) is migrated to TypeScript.
})(IOURequestStepCategoryWithFullTransactionOrNotFound);
