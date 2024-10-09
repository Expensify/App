import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import * as Illustrations from '@components/Icon/Illustrations';
import {useSession} from '@components/OnyxProvider';
import TagPicker from '@components/TagPicker';
import Text from '@components/Text';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as IOUUtils from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as IOU from '@userActions/IOU';
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
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID ?? 0}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '-1'}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report ? report.policyID : '-1'}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${report ? report.policyID : '-1'}`);
    let reportID: string | undefined = '-1';
    if (action === CONST.IOU.ACTION.EDIT) {
        reportID = iouType === CONST.IOU.TYPE.SPLIT ? report?.reportID : report?.parentReportID;
    }
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {canEvict: false});
    const session = useSession();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const tagListIndex = Number(rawTagIndex);
    const policyTagListName = PolicyUtils.getTagListName(policyTags, tagListIndex);

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;
    const isEditingSplitBill = isEditing && isSplitBill;
    const currentTransaction = isEditingSplitBill && !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction;
    const transactionTag = TransactionUtils.getTag(currentTransaction);
    const tag = TransactionUtils.getTag(currentTransaction, tagListIndex);
    const reportAction = reportActions?.[report?.parentReportActionID ?? reportActionID] ?? null;
    const canEditSplitBill = isSplitBill && reportAction && session?.accountID === reportAction.actorAccountID && TransactionUtils.areRequiredFieldsEmpty(transaction);
    const policyTagLists = useMemo(() => PolicyUtils.getTagLists(policyTags), [policyTags]);

    const shouldShowTag = transactionTag || OptionsListUtils.hasEnabledTags(policyTagLists);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage =
        !ReportUtils.isReportInGroupPolicy(report) ||
        (isEditing && (isSplitBill ? !canEditSplitBill : !ReportActionsUtils.isMoneyRequestAction(reportAction) || !ReportUtils.canEditMoneyRequest(reportAction)));

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const updateTag = (selectedTag: Partial<ReportUtils.OptionData>) => {
        const isSelectedTag = selectedTag.searchText === tag;
        const searchText = selectedTag.searchText ?? '';
        const updatedTag = IOUUtils.insertTagIntoTransactionTagsString(transactionTag, isSelectedTag ? '' : searchText, tagListIndex);
        if (isEditingSplitBill) {
            IOU.setDraftSplitTransaction(transactionID, {tag: updatedTag});
            navigateBack();
            return;
        }
        if (isEditing) {
            IOU.updateMoneyRequestTag(transactionID, report?.reportID, updatedTag, policy, policyTags, policyCategories);
            navigateBack();
            return;
        }
        IOU.setMoneyRequestTag(transactionID, updatedTag);
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
                        icon={Illustrations.EmptyStateExpenses}
                        title={translate('workspace.tags.emptyTags.title')}
                        subtitle={translate('workspace.tags.emptyTags.subtitle')}
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
                                        ROUTES.SETTINGS_TAGS_ROOT.getRoute(
                                            policy?.id ?? '-1',
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
            {shouldShowTag && (
                <>
                    <Text style={[styles.ph5, styles.pv3]}>{translate('iou.tagSelection')}</Text>
                    <TagPicker
                        policyID={report?.policyID}
                        tagListName={policyTagListName}
                        tagListIndex={tagListIndex}
                        selectedTag={tag}
                        onSubmit={updateTag}
                    />
                </>
            )}
        </StepScreenWrapper>
    );
}

IOURequestStepTag.displayName = 'IOURequestStepTag';

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepTag));
