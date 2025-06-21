import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import {EmptyStateExpenses} from '@components/Icon/Illustrations';
import {useSession} from '@components/OnyxProvider';
import {useSearchContext} from '@components/Search/SearchContext';
import TagPicker from '@components/TagPicker';
import Text from '@components/Text';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setDraftSplitTransaction, setMoneyRequestTag, updateMoneyRequestTag} from '@libs/actions/IOU';
import {insertTagIntoTransactionTagsString} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getTagList, getTagListName, getTagLists, hasDependentTags as hasDependentTagsPolicyUtils, isPolicyAdmin} from '@libs/PolicyUtils';
import {isMoneyRequestAction} from '@libs/ReportActionsUtils';
import type {OptionData} from '@libs/ReportUtils';
import {canEditMoneyRequest, isReportInGroupPolicy} from '@libs/ReportUtils';
import {hasEnabledTags} from '@libs/TagsOptionsListUtils';
import {areRequiredFieldsEmpty, getTag} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import StepScreenWrapper from './StepScreenWrapper';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepTagProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_TAG> & WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_TAG>;

function IOURequestStepTag({
    report,
    route: {
        params: {action, orderWeight: rawTagIndex, transactionID, backTo, iouType, reportActionID},
    },
    transaction,
}: IOURequestStepTagProps) {
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: true});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {canBeMissing: false});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`, {canBeMissing: false});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${report?.policyID}`, {canBeMissing: false});
    let reportID: string | undefined;
    if (action === CONST.IOU.ACTION.EDIT) {
        reportID = iouType === CONST.IOU.TYPE.SPLIT ? report?.reportID : report?.parentReportID;
    }
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {canEvict: false, canBeMissing: true});
    const session = useSession();
    const styles = useThemeStyles();
    const {currentSearchHash} = useSearchContext();
    const {translate} = useLocalize();

    const tagListIndex = Number(rawTagIndex);
    const policyTagListName = getTagListName(policyTags, tagListIndex);

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;
    const isSplitExpense = iouType === CONST.IOU.TYPE.SPLIT_EXPENSE;
    const isEditingSplit = (isSplitBill || isSplitExpense) && isEditing;
    const currentTransaction = isEditingSplit && !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction;
    const transactionTag = getTag(currentTransaction);
    const tag = getTag(currentTransaction, tagListIndex);
    const reportAction = reportActions?.[report?.parentReportActionID ?? reportActionID] ?? null;
    const canEditSplitBill = isSplitBill && reportAction && session?.accountID === reportAction.actorAccountID && areRequiredFieldsEmpty(transaction);
    const canEditSplitExpense = isSplitExpense && !!transaction;
    const policyTagLists = useMemo(() => getTagLists(policyTags), [policyTags]);

    const hasDependentTags = useMemo(() => hasDependentTagsPolicyUtils(policy, policyTags), [policy, policyTags]);
    const shouldShowTag = transactionTag || hasEnabledTags(policyTagLists);

    // eslint-disable-next-line rulesdir/no-negated-variables
    let shouldShowNotFoundPage = false;

    if (!isReportInGroupPolicy(report)) {
        shouldShowNotFoundPage = true;
    } else if (isEditing) {
        if (isSplitBill) {
            shouldShowNotFoundPage = !canEditSplitBill;
        } else if (isSplitExpense) {
            shouldShowNotFoundPage = !canEditSplitExpense;
        } else {
            shouldShowNotFoundPage = !isMoneyRequestAction(reportAction) || !canEditMoneyRequest(reportAction);
        }
    }

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const updateTag = (selectedTag: Partial<OptionData>) => {
        const isSelectedTag = selectedTag.searchText === tag;
        const searchText = selectedTag.searchText ?? '';
        let updatedTag: string;

        if (hasDependentTags) {
            const tagParts = transactionTag ? transactionTag.split(':') : [];

            if (isSelectedTag) {
                // Deselect: clear this and all child tags
                tagParts.splice(tagListIndex);
            } else {
                // Select new tag: replace this index and clear child tags
                tagParts.splice(tagListIndex, tagParts.length - tagListIndex, searchText);

                // Check for auto-selection of subsequent tags
                for (let i = tagListIndex + 1; i < policyTagLists.length; i++) {
                    const availableNextLevelTags = getTagList(policyTags, i);
                    const enabledTags = Object.values(availableNextLevelTags.tags).filter((t) => t.enabled);

                    if (enabledTags.length === 1) {
                        // If there is only one enabled tag, we can auto-select it
                        const firstTag = enabledTags.at(0);
                        if (firstTag) {
                            tagParts.push(firstTag.name);
                        }
                    } else {
                        // If there are no enabled tags or more than one, stop auto-selecting
                        break;
                    }
                }
            }

            updatedTag = tagParts.join(':');
        } else {
            // Independent tags (fallback): use comma-separated list
            updatedTag = insertTagIntoTransactionTagsString(transactionTag, isSelectedTag ? '' : searchText, tagListIndex);
        }

        if (isEditingSplit) {
            setDraftSplitTransaction(transactionID, {tag: updatedTag});
            navigateBack();
            return;
        }

        if (isEditing) {
            updateMoneyRequestTag(transactionID, report?.reportID, updatedTag, policy, policyTags, policyCategories, currentSearchHash);
            navigateBack();
            return;
        }

        setMoneyRequestTag(transactionID, updatedTag);
        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={policyTagListName}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepTag.displayName}
            shouldShowNotFoundPage={shouldShowNotFoundPage}
        >
            {!shouldShowTag && (
                <View style={[styles.flex1]}>
                    <WorkspaceEmptyStateSection
                        shouldStyleAsCard={false}
                        icon={EmptyStateExpenses}
                        title={translate('workspace.tags.emptyTags.title')}
                        subtitle={translate('workspace.tags.emptyTags.subtitle')}
                        containerStyle={[styles.flex1, styles.justifyContentCenter]}
                    />
                    {isPolicyAdmin(policy) && (
                        <FixedFooter style={[styles.mtAuto, styles.pt5]}>
                            <Button
                                large
                                success
                                style={[styles.w100]}
                                onPress={() =>
                                    Navigation.navigate(
                                        ROUTES.SETTINGS_TAGS_ROOT.getRoute(
                                            policy?.id,
                                            ROUTES.MONEY_REQUEST_STEP_TAG.getRoute(action, iouType, tagListIndex, transactionID, report?.reportID, backTo, reportActionID),
                                        ),
                                    )
                                }
                                text={translate('workspace.tags.editTags')}
                                pressOnEnter
                            />
                        </FixedFooter>
                    )}
                </View>
            )}
            {!!shouldShowTag && (
                <>
                    <Text style={[styles.ph5, styles.pv3]}>{translate('iou.tagSelection')}</Text>
                    <TagPicker
                        policyID={report?.policyID}
                        tagListName={policyTagListName}
                        tagListIndex={tagListIndex}
                        selectedTag={tag}
                        transactionTag={transactionTag}
                        hasDependentTags={hasDependentTags}
                        onSubmit={updateTag}
                    />
                </>
            )}
        </StepScreenWrapper>
    );
}

IOURequestStepTag.displayName = 'IOURequestStepTag';

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepTag));
