import {useCallback, useContext, useMemo, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useFilesValidation from '@hooks/useFilesValidation';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import {cleanFileObject, cleanFileObjectName, getFilesFromClipboardEvent} from '@libs/fileDownload/FileUtils';
import {hasOnlyPersonalPolicies as hasOnlyPersonalPoliciesUtil} from '@libs/PolicyUtils';
import {isSelfDM} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import Navigation from '@navigation/Navigation';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import {initMoneyRequest, replaceReceipt, setMoneyRequestParticipantsFromReport, setMoneyRequestReceipt} from '@userActions/IOU';
import {buildOptimisticTransactionAndCreateDraft} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {FileObject} from '@src/types/utils/Attachment';

type AttachmentUploadValidationProps = {
    policy: OnyxEntry<OnyxTypes.Policy>;
    reportID: string;
    addAttachment: (file: FileObject | FileObject[]) => void;
    onAttachmentPreviewClose: () => void;
    exceededMaxLength: boolean | number | null;
    shouldAddOrReplaceReceipt: boolean;
    transactionID: string | undefined;
    report: OnyxEntry<OnyxTypes.Report>;
    newParentReport: OnyxEntry<OnyxTypes.Report>;
    currentDate: string | undefined;
    currentUserPersonalDetails: CurrentUserPersonalDetails;
    isAttachmentPreviewActive: boolean;
    setIsAttachmentPreviewActive: (isActive: boolean) => void;
};

function useAttachmentUploadValidation({
    policy,
    reportID,
    addAttachment,
    onAttachmentPreviewClose,
    exceededMaxLength,
    shouldAddOrReplaceReceipt,
    transactionID,
    report,
    newParentReport,
    currentDate,
    currentUserPersonalDetails,
    isAttachmentPreviewActive,
    setIsAttachmentPreviewActive,
}: AttachmentUploadValidationProps) {
    const {translate} = useLocalize();
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy?.id}`, {canBeMissing: true});
    const personalPolicy = usePersonalPolicy();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const hasOnlyPersonalPolicies = useMemo(() => hasOnlyPersonalPoliciesUtil(allPolicies), [allPolicies]);

    const reportAttachmentsContext = useContext(AttachmentModalContext);
    const showAttachmentModalScreen = useCallback(
        (file: FileObject | FileObject[], dataTransferItems?: DataTransferItem[]) => {
            reportAttachmentsContext.setCurrentAttachment<typeof SCREENS.REPORT_ADD_ATTACHMENT>({
                reportID,
                file,
                dataTransferItems,
                headerTitle: translate('reportActionCompose.sendAttachment'),
                onConfirm: addAttachment,
                onShow: () => setIsAttachmentPreviewActive(true),
                onClose: onAttachmentPreviewClose,
                shouldDisableSendButton: !!exceededMaxLength,
            });
            Navigation.navigate(ROUTES.REPORT_ADD_ATTACHMENT.getRoute(reportID));
        },
        [addAttachment, exceededMaxLength, onAttachmentPreviewClose, reportAttachmentsContext, reportID, setIsAttachmentPreviewActive, translate],
    );

    const attachmentUploadType = useRef<'receipt' | 'attachment'>(undefined);
    const onFilesValidated = (files: FileObject[], dataTransferItems: DataTransferItem[]) => {
        if (files.length === 0) {
            return;
        }

        if (attachmentUploadType.current === 'attachment') {
            showAttachmentModalScreen(files, dataTransferItems);
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

    const validateAttachments = useCallback(
        ({dragEvent, files}: {dragEvent?: DragEvent; files?: FileObject | FileObject[]}) => {
            if (isAttachmentPreviewActive) {
                return;
            }

            let extractedFiles: FileObject[] = [];

            if (files) {
                extractedFiles = Array.isArray(files) ? files : [files];
            } else {
                if (!dragEvent) {
                    return;
                }

                extractedFiles = getFilesFromClipboardEvent(dragEvent);
            }

            const dataTransferItems = Array.from(dragEvent?.dataTransfer?.items ?? []);
            if (extractedFiles.length === 0) {
                return;
            }

            const validIndices: number[] = [];
            const fileObjects = extractedFiles
                .map((item, index) => {
                    const fileObject = cleanFileObject(item);
                    const cleanedFileObject = cleanFileObjectName(fileObject);
                    if (cleanedFileObject !== null) {
                        validIndices.push(index);
                    }
                    return cleanedFileObject;
                })
                .filter((fileObject) => fileObject !== null);

            if (!fileObjects.length) {
                return;
            }

            // Create a filtered items array that matches the fileObjects
            const filteredItems = dataTransferItems && validIndices.length > 0 ? validIndices.map((index) => dataTransferItems.at(index) ?? ({} as DataTransferItem)) : undefined;

            attachmentUploadType.current = 'attachment';
            validateFiles(fileObjects, filteredItems, {isValidatingReceipts: false});
        },
        [isAttachmentPreviewActive, validateFiles],
    );

    const onReceiptDropped = useCallback(
        (e: DragEvent) => {
            if (policy && shouldRestrictUserBillableActions(policy.id)) {
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

                attachmentUploadType.current = 'receipt';
                validateFiles([file], items);
            }

            attachmentUploadType.current = 'receipt';
            validateFiles(files, items, {isValidatingReceipts: true});
        },
        [policy, shouldAddOrReplaceReceipt, transactionID, validateFiles],
    );

    return {
        validateAttachments,
        onReceiptDropped,
        PDFValidationComponent,
        ErrorModal,
    };
}

export default useAttachmentUploadValidation;
