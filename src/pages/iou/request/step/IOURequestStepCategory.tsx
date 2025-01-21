import lodashIsEmpty from 'lodash/isEmpty';
import React, {useEffect} from 'react';
import {ActivityIndicator, InteractionManager, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import CategoryPicker from '@components/CategoryPicker';
import FixedFooter from '@components/FixedFooter';
import * as Illustrations from '@components/Icon/Illustrations';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {setDraftSplitTransaction, setMoneyRequestCategory, updateMoneyRequestCategory} from '@libs/actions/IOU';
import {enablePolicyCategories, getPolicyCategories} from '@libs/actions/Policy/Category';
import Navigation from '@libs/Navigation/Navigation';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {canEditMoneyRequest, getTransactionDetails, isGroupPolicy, isReportInGroupPolicy} from '@libs/ReportUtils';
import {areRequiredFieldsEmpty} from '@libs/TransactionUtils';
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
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [policyReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}$getIOURequestPolicyID(transaction, reportReal)}`);
    const [policyDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}$getIOURequestPolicyID(transaction, reportDraft)}`);
    const [policyCategoriesReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}$getIOURequestPolicyID(transaction, reportReal)}`);
    const [policyCategoriesDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}$getIOURequestPolicyID(transaction, reportDraft)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}$getIOURequestPolicyID(transaction, reportReal)}`);
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
    const {currentSearchHash} = useSearchContext();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplitBill = isEditing && iouType === CONST.IOU.TYPE.SPLIT;
    const currentTransaction = isEditingSplitBill && !lodashIsEmpty(splitDraftTransaction) ? splitDraftTransaction : transaction;
    const transactionCategory = getTransactionDetails(currentTransaction)?.category;

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const reportAction = reportActions?.[report?.parentReportActionID || reportActionID] ?? null;

    const shouldShowCategory =
        (isReportInGroupPolicy(report) || isGroupPolicy(policy?.type ?? '')) &&
        // The transactionCategory can be an empty string, so to maintain the logic we'd like to keep it in this shape until utils refactor
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        (!!transactionCategory || hasEnabledOptions(Object.values(policyCategories ?? {})));

    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;
    const canEditSplitBill = isSplitBill && reportAction && session?.accountID === reportAction.actorAccountID && areRequiredFieldsEmpty(transaction);
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = isEditing && (isSplitBill ? !canEditSplitBill : !isMoneyRequestAction(reportAction) || !canEditMoneyRequest(reportAction));

    const fetchData = () => {
        if ((!!policy && !!policyCategories) || !report?.policyID) {
            return;
        }

        getPolicyCategories(report?.policyID);
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
                setDraftSplitTransaction(transaction.transactionID, {category: updatedCategory}, policy);
                navigateBack();
                return;
            }

            if (isEditing && report) {
                updateMoneyRequestCategory(transaction.transactionID, report.reportID, updatedCategory, policy, policyTags, policyCategories, currentSearchHash);
                navigateBack();
                return;
            }
        }

        setMoneyRequestCategory(transactionID, updatedCategory, policy?.id);

        if (action === CONST.IOU.ACTION.CATEGORIZE) {
            if (report?.reportID) {
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, report.reportID));
            }
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
                    {isPolicyAdmin(policy) && (
                        <FixedFooter style={[styles.mtAuto, styles.pt5]}>
                            <Button
                                large
                                success
                                style={[styles.w100]}
                                onPress={() => {
                                    if (!policy?.id || !report?.reportID) {
                                        return;
                                    }

                                    if (!policy.areCategoriesEnabled) {
                                        enablePolicyCategories(policy.id, true, false);
                                    }
                                    InteractionManager.runAfterInteractions(() => {
                                        Navigation.navigate(
                                            ROUTES.SETTINGS_CATEGORIES_ROOT.getRoute(
                                                policy.id,
                                                ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, iouType, transactionID, report.reportID, backTo, reportActionID),
                                            ),
                                        );
                                    });
                                }}
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
                        policyID={report?.policyID ?? policy?.id}
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
