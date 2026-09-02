import Button from '@components/ButtonComposed';
import FixedFooter from '@components/FixedFooter';
import {useSearchQueryContext} from '@components/Search/SearchContext';
import TagPicker from '@components/TagPicker';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useThemeStyles from '@hooks/useThemeStyles';

import {getIOURequestPolicyID, setMoneyRequestTag} from '@libs/actions/IOU/MoneyRequest';
import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';
import {updateMoneyRequestTag} from '@libs/actions/IOU/UpdateMoneyRequest';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getSelectedWorkspacePolicyID, pickReportForPolicy} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getTagListName, getTagLists, hasDependentTags as hasDependentTagsPolicyUtils, isPolicyAdmin} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import {isSelfDM} from '@libs/ReportUtils';
import {getUpdatedTransactionTag, hasEnabledTags} from '@libs/TagsOptionsListUtils';
import {getTag, getTagArrayFromName, isPerDiemRequest} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useMemo} from 'react';
import {View} from 'react-native';

import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type DynamicIOURequestStepTagProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_TAG> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_TAG>;

function DynamicIOURequestStepTag({
    report,
    route: {
        params: {action, orderWeight: rawTagIndex, transactionID, iouType, reportActionID, reportID: reportIDFromRoute},
    },
    transaction,
}: DynamicIOURequestStepTagProps) {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_TAG.path);
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;
    const isSplitExpense = iouType === CONST.IOU.TYPE.SPLIT_EXPENSE;
    const isEditingSplit = (isSplitBill || isSplitExpense) && isEditing;

    const [participantReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transaction?.participants?.at(0)?.reportID)}`);
    const {policy: policyFromTransaction} = usePolicyForTransaction({
        transaction,
        reportPolicyID: getSelectedWorkspacePolicyID(transaction, action) ?? getIOURequestPolicyID(transaction, pickReportForPolicy(report, participantReport)),
        action,
        iouType,
        isPerDiemRequest: isPerDiemRequest(transaction),
    });
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const policy = policyFromTransaction ?? (isEditingSplit && isSelfDM(report) ? policyForMovingExpenses : undefined);

    const policyID = policy?.id;
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const [policyRecentlyUsedTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [iouReportOwnerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(parentReport?.ownerAccountID)});
    const [reportPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(parentReport?.policyID)}`);

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const delegateAccountID = useDelegateAccountID();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const {isOffline} = useNetwork();

    const styles = useThemeStyles();
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const illustrations = useMemoizedLazyIllustrations(['EmptyStateExpenses']);
    const {currentSearchHash} = useSearchQueryContext();
    const {translate} = useLocalize();
    useRestartOnReceiptFailure(transaction, reportIDFromRoute, iouType, action);

    const tagListIndex = Number(rawTagIndex);
    const policyTagListName = getTagListName(policyTags, tagListIndex);

    const currentTransaction = isEditingSplit && !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction;
    const transactionTag = getTag(currentTransaction);
    const tag = getTag(currentTransaction, tagListIndex);

    const policyTagLists = useMemo(() => getTagLists(policyTags), [policyTags]);

    const hasDependentTags = useMemo(() => hasDependentTagsPolicyUtils(policy, policyTags), [policy, policyTags]);

    // Surface the parent (original) transaction's tag for SPLIT_EXPENSE edits so the user can
    // re-select an "orphaned" tag from a deleted source workspace even when the active workspace
    // has no tags configured. Without this the picker would render an empty list with no way to
    // restore the previously selected value.
    const [allTransactionsForSplitParent] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const parentTransactionTag = useMemo(() => {
        if (!isEditingSplit) {
            return '';
        }
        const parentTransactionID = transaction?.comment?.originalTransactionID;
        if (!parentTransactionID) {
            return '';
        }
        const parentTransaction = allTransactionsForSplitParent?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${parentTransactionID}`];
        return parentTransaction?.tag ?? '';
    }, [isEditingSplit, transaction?.comment?.originalTransactionID, allTransactionsForSplitParent]);

    const additionalTagsToInclude = useMemo(() => {
        if (!parentTransactionTag) {
            return undefined;
        }
        const parentTagAtIndex = getTagArrayFromName(parentTransactionTag).at(tagListIndex);
        return parentTagAtIndex ? [parentTagAtIndex] : undefined;
    }, [parentTransactionTag, tagListIndex]);

    const shouldShowTag = transactionTag || hasEnabledTags(policyTagLists) || !!additionalTagsToInclude?.length;

    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, transaction);

    const navigateBack = () => {
        Navigation.goBack(backPath);
    };

    const saveAndNavigateBack = () => {
        Navigation.goBack(backPath, {shouldSkipFocusRestore: true});
    };

    const updateTag = (selectedTag: Partial<OptionData>) => {
        const updatedTag = getUpdatedTransactionTag({
            transactionTag,
            selectedTagName: selectedTag.searchText ?? '',
            currentTag: tag,
            tagListIndex,
            policyTags,
            hasDependentTags,
            hasMultipleTagLists: policy?.hasMultipleTagLists ?? false,
        });

        if (isEditingSplit) {
            setDraftSplitTransaction(transactionID, splitDraftTransaction, {tag: updatedTag}, getCurrencyDecimals, getCurrencySymbol);
            saveAndNavigateBack();
            return;
        }

        if (isEditing) {
            updateMoneyRequestTag({
                transactionID,
                transactionThreadReport: report,
                parentReport,
                iouReportOwnerLogin,
                tag: updatedTag,
                tagListIndex,
                policy,
                policyTagList: policyTags,
                policyRecentlyUsedTags,
                policyCategories,
                currentUserAccountIDParam,
                currentUserEmailParam,
                isASAPSubmitBetaEnabled,
                hash: currentSearchHash,
                isOffline,
                delegateAccountID,
                reportPolicyTags,
                isTrackIntentUser,
                getCurrencyDecimals,
                getCurrencySymbol,
            });
            saveAndNavigateBack();
            return;
        }

        setMoneyRequestTag(transactionID, updatedTag);
        saveAndNavigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={policyTagListName}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="DynamicIOURequestStepTag"
            shouldShowNotFoundPage={shouldShowNotFoundPage}
        >
            {!shouldShowTag && (
                <View style={[styles.flex1]}>
                    <WorkspaceEmptyStateSection
                        shouldStyleAsCard={false}
                        icon={illustrations.EmptyStateExpenses}
                        title={translate('workspace.tags.emptyTags.title')}
                        subtitle={translate('workspace.tags.emptyTags.subtitle')}
                        containerStyle={[styles.flex1, styles.justifyContentCenter]}
                    />
                    {isPolicyAdmin(policy) && (
                        <FixedFooter style={[styles.mtAuto, styles.pt5]}>
                            <Button
                                size={CONST.BUTTON_SIZE.LARGE}
                                variant={CONST.BUTTON_VARIANT.SUCCESS}
                                style={[styles.w100]}
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID, Navigation.getActiveRoute()))}
                                sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.EDIT_TAGS_BUTTON}
                            >
                                <Button.KeyboardShortcut />
                                <Button.Text>{translate('workspace.tags.editTags')}</Button.Text>
                            </Button>
                        </FixedFooter>
                    )}
                </View>
            )}
            {!!shouldShowTag && (
                <TagPicker
                    policyID={policyID}
                    tagListName={policyTagListName}
                    tagListIndex={tagListIndex}
                    selectedTag={tag}
                    transactionTag={transactionTag}
                    hasDependentTags={hasDependentTags}
                    onSubmit={updateTag}
                    additionalTagsToInclude={additionalTagsToInclude}
                />
            )}
        </StepScreenWrapper>
    );
}

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(DynamicIOURequestStepTag));
