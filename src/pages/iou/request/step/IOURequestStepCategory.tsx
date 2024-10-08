import lodashIsEmpty from 'lodash/isEmpty';
import React, {useEffect} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import CategoryPicker from '@components/CategoryPicker';
import FixedFooter from '@components/FixedFooter';
import * as Illustrations from '@components/Icon/Illustrations';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as IOU from '@userActions/IOU';
import * as Category from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import StepScreenWrapper from './StepScreenWrapper';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepCategoryProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_CATEGORY> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_CATEGORY>;

function IOURequestStepCategory({
    report: reportReal,
    reportDraft,
    route: {
        params: {transactionID, backTo, action, iouType, reportActionID},
    },
    transaction,
}: IOURequestStepCategoryProps) {
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID ?? '-1'}`);
    const [policyReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${IOU.getIOURequestPolicyID(transaction, reportReal)}`);
    const [policyDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${IOU.getIOURequestPolicyID(transaction, reportDraft)}`);
    const [policyCategoriesReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${IOU.getIOURequestPolicyID(transaction, reportReal)}`);
    const [policyCategoriesDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${IOU.getIOURequestPolicyID(transaction, reportDraft)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${IOU.getIOURequestPolicyID(transaction, reportReal)}`);
    let reportID = '-1';
    if (action === CONST.IOU.ACTION.EDIT && reportReal) {
        if (iouType === CONST.IOU.TYPE.SPLIT) {
            reportID = reportReal.reportID;
        } else if (reportReal.parentReportID) {
            reportID = reportReal.parentReportID;
        }
    }
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {canEvict: false});
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const report = reportReal ?? reportDraft;
    const policy = policyReal ?? policyDraft;
    const policyCategories = policyCategoriesReal ?? policyCategoriesDraft;
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplitBill = isEditing && iouType === CONST.IOU.TYPE.SPLIT;
    const transactionCategory = ReportUtils.getTransactionDetails(isEditingSplitBill && !lodashIsEmpty(splitDraftTransaction) ? splitDraftTransaction : transaction)?.category;

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const reportAction = reportActions?.[report?.parentReportActionID || reportActionID] ?? null;

    const shouldShowCategory =
        (ReportUtils.isReportInGroupPolicy(report) || ReportUtils.isGroupPolicy(policy?.type ?? '')) &&
        // The transactionCategory can be an empty string, so to maintain the logic we'd like to keep it in this shape until utils refactor
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        (!!transactionCategory || OptionsListUtils.hasEnabledOptions(Object.values(policyCategories ?? {})));

    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;
    const canEditSplitBill = isSplitBill && reportAction && session?.accountID === reportAction.actorAccountID && TransactionUtils.areRequiredFieldsEmpty(transaction);
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = isEditing && (isSplitBill ? !canEditSplitBill : !ReportActionsUtils.isMoneyRequestAction(reportAction) || !ReportUtils.canEditMoneyRequest(reportAction));

    const fetchData = () => {
        if (policy && policyCategories) {
            return;
        }

        Category.getPolicyCategories(report?.policyID ?? '-1');
    };
    const {isOffline} = useNetwork({onReconnect: fetchData});
    const isLoading = !isOffline && policyCategories === undefined;
    const shouldShowEmptyState = policyCategories !== undefined && !shouldShowCategory;
    const shouldShowOfflineView = policyCategories === undefined && isOffline;

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

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

        if (action === CONST.IOU.ACTION.CATEGORIZE) {
            Navigation.closeAndNavigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, report?.reportID ?? '-1'));
            return;
        }

        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.category')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            shouldShowNotFoundPage={shouldShowNotFoundPage}
            shouldShowOfflineIndicator={policyCategories !== undefined}
            testID={IOURequestStepCategory.displayName}
        >
            {isLoading && (
                <ActivityIndicator
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    style={[styles.flex1]}
                    color={theme.spinner}
                />
            )}
            {shouldShowOfflineView && <FullPageOfflineBlockingView>{null}</FullPageOfflineBlockingView>}
            {shouldShowEmptyState && (
                <View style={[styles.flex1]}>
                    <WorkspaceEmptyStateSection
                        shouldStyleAsCard={false}
                        icon={Illustrations.EmptyStateExpenses}
                        title={translate('workspace.categories.emptyCategories.title')}
                        subtitle={translate('workspace.categories.emptyCategories.subtitle')}
                        containerStyle={[styles.flex1, styles.justifyContentCenter]}
                    />
                    {PolicyUtils.isPolicyAdmin(policy) && (
                        <FixedFooter style={[styles.mtAuto, styles.pt5]}>
                            <Button
                                large
                                success
                                style={[styles.w100]}
                                onPress={() =>
                                    Navigation.navigate(
                                        ROUTES.SETTINGS_CATEGORIES_ROOT.getRoute(
                                            policy?.id ?? '-1',
                                            ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, iouType, transactionID, report?.reportID ?? '-1', backTo, reportActionID),
                                        ),
                                    )
                                }
                                text={translate('workspace.categories.editCategories')}
                                pressOnEnter
                            />
                        </FixedFooter>
                    )}
                </View>
            )}
            {!shouldShowEmptyState && !isLoading && !shouldShowOfflineView && (
                <>
                    <Text style={[styles.ph5, styles.pv3]}>{translate('iou.categorySelection')}</Text>
                    <CategoryPicker
                        selectedCategory={transactionCategory}
                        policyID={report?.policyID ?? policy?.id ?? '-1'}
                        onSubmit={updateCategory}
                    />
                </>
            )}
        </StepScreenWrapper>
    );
}

IOURequestStepCategory.displayName = 'IOURequestStepCategory';

/* eslint-disable rulesdir/no-negated-variables */
const IOURequestStepCategoryWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepCategory);
/* eslint-disable rulesdir/no-negated-variables */
const IOURequestStepCategoryWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepCategoryWithFullTransactionOrNotFound);
export default IOURequestStepCategoryWithWritableReportOrNotFound;
