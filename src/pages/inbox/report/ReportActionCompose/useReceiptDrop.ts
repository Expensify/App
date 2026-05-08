import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import type {OnyxEntry} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFilesValidation from '@hooks/useFilesValidation';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import {getFilesFromClipboardEvent} from '@libs/fileDownload/FileUtils';
import {hasOnlyPersonalPolicies as hasOnlyPersonalPoliciesUtil} from '@libs/PolicyUtils';
import {isSelfDM} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import Navigation from '@navigation/Navigation';
import {initMoneyRequest, setMoneyRequestParticipantsFromReport} from '@userActions/IOU';
import {replaceReceipt, setMoneyRequestReceipt} from '@userActions/IOU/Receipt';
import {buildOptimisticTransactionAndCreateDraft} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

type UseReceiptDropParams = {
    reportID: string;
    report: OnyxEntry<OnyxTypes.Report>;
    shouldAddOrReplaceReceipt: boolean;
    transactionID: string | undefined;
};

function useReceiptDrop({reportID, report, shouldAddOrReplaceReceipt, transactionID}: UseReceiptDropParams) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [newParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [currentDate] = useOnyx(ONYXKEYS.CURRENT_DATE);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy?.id}`);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const personalPolicy = usePersonalPolicy();
    const [hasOnlyPersonalPolicies = true] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: hasOnlyPersonalPoliciesUtil});
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});

    const onFilesValidated = (files: FileObject[]) => {
        if (files.length === 0) {
            return;
        }

        if (shouldAddOrReplaceReceipt && transactionID) {
            const source = URL.createObjectURL(files.at(0) as Blob);
            replaceReceipt({transactionID, file: files.at(0) as File, source, transactionPolicy: policy, transactionPolicyCategories: policyCategories});
            return;
        }

        const initialTransaction = initMoneyRequest({
            reportID,
            personalPolicy,
            newIouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            report,
            parentReport: newParentReport,
            currentDate,
            currentUserPersonalDetails,
            hasOnlyPersonalPolicies,
            draftTransactionIDs,
        });

        for (const [index, file] of files.entries()) {
            const source = URL.createObjectURL(file as Blob);
            const newTransaction =
                index === 0
                    ? (initialTransaction as Partial<OnyxTypes.Transaction>)
                    : buildOptimisticTransactionAndCreateDraft({
                          initialTransaction: initialTransaction as Partial<OnyxTypes.Transaction>,
                          currentUserPersonalDetails,
                          reportID,
                      });
            const newTransactionID = newTransaction?.transactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID;
            setMoneyRequestReceipt(newTransactionID, source, file.name ?? '', true, file.type);
            setMoneyRequestParticipantsFromReport(newTransactionID, report, currentUserPersonalDetails.accountID);
        }
        Navigation.navigate(
            ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(
                CONST.IOU.ACTION.CREATE,
                isSelfDM(report) ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT,
                CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                reportID,
            ),
        );
    };

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation(onFilesValidated);

    const onReceiptDropped = (e: DragEvent) => {
        if (policy && shouldRestrictUserBillableActions(policy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, currentUserPersonalDetails.accountID)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
            return;
        }

        const files = getFilesFromClipboardEvent(e);
        const items = Array.from(e.dataTransfer?.items ?? []);

        if (shouldAddOrReplaceReceipt && transactionID) {
            const file = files.at(0);
            if (!file) {
                return;
            }

            validateFiles([file], items);
            return;
        }

        validateFiles(files, items, {isValidatingReceipts: true});
    };

    return {onReceiptDropped, PDFValidationComponent, ErrorModal};
}

export default useReceiptDrop;
