import {useCallback} from 'react';

import useCreateEmptyReportConfirmation from './useCreateEmptyReportConfirmation';
import useShouldShowEmptyReportConfirmation from './useShouldShowEmptyReportConfirmation';

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
    const shouldShowEmptyReportConfirmation = useShouldShowEmptyReportConfirmation(policyID, shouldBypassConfirmation);

    const handleReportCreationConfirmed = useCallback(
        (shouldDismissEmptyReportsConfirmation?: boolean) => {
            onCreateReport(shouldDismissEmptyReportsConfirmation);
        },
        [onCreateReport],
    );

    const {openCreateReportConfirmation} = useCreateEmptyReportConfirmation({
        policyID,
        policyName,
        onConfirm: handleReportCreationConfirmed,
        onCancel,
    });

    const handleCreateReport = useCallback(() => {
        if (shouldShowEmptyReportConfirmation) {
            openCreateReportConfirmation();
            return;
        }

        onCreateReport(false);
    }, [shouldShowEmptyReportConfirmation, onCreateReport, openCreateReportConfirmation]);

    return {
        handleCreateReport,
        hasEmptyReport: shouldShowEmptyReportConfirmation,
    };
}
