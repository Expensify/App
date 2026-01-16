import {accountIDSelector} from '@selectors/Session';
import {useCallback, useMemo} from 'react';
import type {ReactNode} from 'react';
import {hasEmptyReportsForPolicy, reportSummariesOnyxSelector} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import useCreateEmptyReportConfirmation from './useCreateEmptyReportConfirmation';
import useOnyx from './useOnyx';

type UseConditionalCreateEmptyReportConfirmationParams = {
    /** The policy ID for which the report is being created */
    policyID?: string;
    /** The display name of the policy/workspace */
    policyName?: string;
    /** Callback executed after the user confirms report creation */
    onCreateReport: (shouldDismissEmptyReportsConfirmation?: boolean) => void;
    /** Optional callback executed when the confirmation modal is cancelled */
    onCancel?: () => void;
    /** Whether the confirmation modal should be bypassed even if an empty report exists */
    shouldBypassConfirmation?: boolean;
};

type UseConditionalCreateEmptyReportConfirmationResult = {
    /** Function that handles report creation with optional confirmation */
    handleCreateReport: () => void;
    /** Whether an empty report already exists for the provided policy */
    hasEmptyReport: boolean;
    /** The confirmation modal React component to render */
    CreateReportConfirmationModal: ReactNode;
};

/**
 * Hook that combines the empty report detection logic with the confirmation modal.
 * It ensures the provided callback is only executed after the user confirms creation when necessary.
 */
export default function useConditionalCreateEmptyReportConfirmation({
    policyID,
    policyName,
    onCreateReport,
    onCancel,
    shouldBypassConfirmation = false,
}: UseConditionalCreateEmptyReportConfirmationParams): UseConditionalCreateEmptyReportConfirmationResult {
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector, canBeMissing: true});
    type ReportSummary = ReturnType<typeof reportSummariesOnyxSelector>[number];
    const [reportSummaries = getEmptyArray<ReportSummary>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        canBeMissing: true,
        selector: reportSummariesOnyxSelector,
    });
    const [hasDismissedEmptyReportsConfirmation] = useOnyx(ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED, {canBeMissing: true});

    const hasEmptyReport = useMemo(() => hasEmptyReportsForPolicy(reportSummaries, policyID, accountID), [accountID, policyID, reportSummaries]);
    const shouldSkipConfirmation = useMemo(() => shouldBypassConfirmation || hasDismissedEmptyReportsConfirmation === true, [hasDismissedEmptyReportsConfirmation, shouldBypassConfirmation]);

    const handleReportCreationConfirmed = useCallback(
        (shouldDismissEmptyReportsConfirmation?: boolean) => {
            onCreateReport(shouldDismissEmptyReportsConfirmation);
        },
        [onCreateReport],
    );

    const {openCreateReportConfirmation, CreateReportConfirmationModal} = useCreateEmptyReportConfirmation({
        policyID,
        policyName,
        onConfirm: handleReportCreationConfirmed,
        onCancel,
    });

    const handleCreateReport = useCallback(() => {
        if (hasEmptyReport && !shouldSkipConfirmation) {
            openCreateReportConfirmation();
            return;
        }

        onCreateReport(false);
    }, [hasEmptyReport, onCreateReport, openCreateReportConfirmation, shouldSkipConfirmation]);

    return {
        handleCreateReport,
        hasEmptyReport,
        CreateReportConfirmationModal,
    };
}
