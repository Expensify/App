import React, {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import TagPicker from '@components/TagPicker';
import Text from '@components/Text';
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
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import StepScreenWrapper from './StepScreenWrapper';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepTagOnyxProps = {
    /** The draft transaction that holds data to be persisted on the current transaction */
    splitDraftTransaction: OnyxEntry<OnyxTypes.Transaction>;

    /** The policy of the report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The category configuration of the report's policy */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;

    /** Collection of tags attached to a policy */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;

    /** The actions from the parent report */
    reportActions: OnyxEntry<OnyxTypes.ReportActions>;

    /** Session info for the currently logged in user. */
    session: OnyxEntry<OnyxTypes.Session>;
};

type IOURequestStepTagProps = IOURequestStepTagOnyxProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_TAG> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_TAG>;

function IOURequestStepTag({
    policy,
    policyCategories,
    policyTags,
    report,
    route: {
        params: {action, orderWeight: rawTagIndex, transactionID, backTo, iouType, reportActionID},
    },
    transaction,
    splitDraftTransaction,
    reportActions,
    session,
}: IOURequestStepTagProps) {
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

    const shouldShowTag = ReportUtils.isReportInGroupPolicy(report) && (transactionTag || OptionsListUtils.hasEnabledTags(policyTagLists));

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage =
        !shouldShowTag || (isEditing && (isSplitBill ? !canEditSplitBill : !ReportActionsUtils.isMoneyRequestAction(reportAction) || !ReportUtils.canEditMoneyRequest(reportAction)));

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
            IOU.updateMoneyRequestTag(transactionID, report?.reportID ?? '-1', updatedTag, policy, policyTags, policyCategories);
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
            <>
                <Text style={[styles.ph5, styles.pv3]}>{translate('iou.tagSelection')}</Text>
                <TagPicker
                    policyID={report?.policyID ?? '-1'}
                    tagListName={policyTagListName}
                    tagListIndex={tagListIndex}
                    selectedTag={tag}
                    onSubmit={updateTag}
                />
            </>
        </StepScreenWrapper>
    );
}

IOURequestStepTag.displayName = 'IOURequestStepTag';

function ComponentWithOnyx(props: Omit<IOURequestStepTagProps, keyof IOURequestStepTagOnyxProps>) {
    const transactionID = props.route.params.transactionID ?? 0;
    const [splitDraftTransaction, splitDraftTransactionMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);

    const [policy, policyMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${props.report ? props.report.policyID : '-1'}`);

    const [policyCategories, policyCategoriesMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${props.report ? props.report.policyID : '-1'}`);

    const [policyTags, policyTagsMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${props.report ? props.report.policyID : '-1'}`);

    let reportID: string | undefined = '-1';
    if (props.route.params.action === CONST.IOU.ACTION.EDIT) {
        reportID = props.route.params.iouType === CONST.IOU.TYPE.SPLIT ? props.report?.reportID : props.report?.parentReportID;
    }
    const [reportActions, reportActionsMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canEvict: false,
    });

    const [session, sessionMetadata] = useOnyx(ONYXKEYS.SESSION);

    if (isLoadingOnyxValue(splitDraftTransactionMetadata, policyMetadata, policyCategoriesMetadata, policyTagsMetadata, reportActionsMetadata, sessionMetadata)) {
        return null;
    }

    return (
        <IOURequestStepTag
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            splitDraftTransaction={splitDraftTransaction}
            policy={policy}
            policyCategories={policyCategories}
            policyTags={policyTags}
            reportActions={reportActions}
            session={session}
        />
    );
}

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(ComponentWithOnyx));
