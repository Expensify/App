import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import TagPicker from '@components/TagPicker';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLoadPolicyTags from '@hooks/useLoadPolicyTags';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useThemeStyles from '@hooks/useThemeStyles';
import useUpdateTransactionTag from '@hooks/useUpdateTransactionTag';

import {getIOURequestPolicyID} from '@libs/actions/IOU/MoneyRequest';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getSelectedWorkspacePolicyID, pickReportForPolicy} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getTagListName, getTagLists, hasDependentTags as hasDependentTagsPolicyUtils, isPolicyAdmin} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import {isSelfDM} from '@libs/ReportUtils';
import {hasEnabledTags} from '@libs/TagsOptionsListUtils';
import {getTag, getTagArrayFromName, isPerDiemRequest} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React from 'react';
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
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);

    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['EmptyStateExpenses']);
    const {translate} = useLocalize();
    useRestartOnReceiptFailure(transaction, reportIDFromRoute, iouType, action);

    const tagListIndex = Number(rawTagIndex);
    const policyTagListName = getTagListName(policyTags, tagListIndex);

    const currentTransaction = isEditingSplit && !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction;
    const transactionTag = getTag(currentTransaction);
    const tag = getTag(currentTransaction, tagListIndex);

    const policyTagLists = getTagLists(policyTags);

    const hasDependentTags = hasDependentTagsPolicyUtils(policy, policyTags);

    // Surface the parent (original) transaction's tag for SPLIT_EXPENSE edits so the user can
    // re-select an "orphaned" tag from a deleted source workspace even when the active workspace
    // has no tags configured. Without this the picker would render an empty list with no way to
    // restore the previously selected value.
    const [allTransactionsForSplitParent] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    let parentTransactionTag;
    if (!isEditingSplit) {
        parentTransactionTag = '';
    } else {
        const parentTransactionID = transaction?.comment?.originalTransactionID;
        if (!parentTransactionID) {
            parentTransactionTag = '';
        } else {
            const parentTransaction = allTransactionsForSplitParent?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${parentTransactionID}`];
            parentTransactionTag = parentTransaction?.tag ?? '';
        }
    }

    let additionalTagsToInclude: string[] | undefined;
    if (!parentTransactionTag) {
        additionalTagsToInclude = undefined;
    } else {
        const parentTagAtIndex = getTagArrayFromName(parentTransactionTag).at(tagListIndex);
        additionalTagsToInclude = parentTagAtIndex ? [parentTagAtIndex] : undefined;
    }

    // Backfill the policy's tags here too, not just inside TagPicker: on a lazy-loaded account an absent collection
    // makes `hasEnabledTags` false, so without this the empty state renders, TagPicker never mounts, and the read it
    // owns never fires — leaving the user unable to assign a tag to an untagged expense.
    const {isLoadingPolicyTags} = useLoadPolicyTags(policyID);

    // An absent tags collection means "not read yet", not "this policy has no tags", so keep the picker mounted while
    // the read is in flight and let it show its own loading state. Once the tags land, a genuinely tag-less policy
    // falls back to the empty state as before.
    const shouldShowTag = transactionTag || hasEnabledTags(policyTagLists) || !!additionalTagsToInclude?.length || isLoadingPolicyTags;

    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, transaction);

    const navigateBack = () => {
        Navigation.goBack(backPath);
    };

    const saveAndNavigateBack = () => {
        Navigation.goBack(backPath, {shouldSkipFocusRestore: true});
    };

    const {updateTag: updateTransactionTag} = useUpdateTransactionTag({transactionID, transaction, report, policy, policyTags, tagListIndex, isEditing, isEditingSplit});

    const updateTag = (selectedTag: Partial<OptionData>) => {
        updateTransactionTag(selectedTag.searchText ?? '');
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
                        containerStyle={[styles.flex1, styles.justifyContentCenter, styles.alignSelfCenter]}
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
