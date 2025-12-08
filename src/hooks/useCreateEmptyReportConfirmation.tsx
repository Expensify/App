import {useCallback, useMemo} from 'react';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';

type UseCreateEmptyReportConfirmationParams = {
    /** The policy ID for which the report is being created */
    policyID?: string;
    /** The display name of the policy/workspace */
    policyName?: string;
    /** Callback function to execute when user confirms report creation */
    onConfirm: () => void;
    /** Optional callback function to execute when user cancels the confirmation */
    onCancel?: () => void;
};

type UseCreateEmptyReportConfirmationResult = {
    /** Function to open the confirmation modal */
    openCreateReportConfirmation: () => void;
};

/**
 * A React hook that provides a confirmation modal for creating empty reports.
 * When a user attempts to create a new report in a workspace where they already have an empty report,
 * this hook displays a confirmation modal to prevent accidental duplicate empty reports.
 *
 * @param params - Configuration object for the hook
 * @param params.policyName - The display name of the policy/workspace
 * @param params.onConfirm - Callback function to execute when user confirms report creation
 * @returns An object containing:
 *          - openCreateReportConfirmation: Function to open the confirmation modal
 *
 * @example
 * const {openCreateReportConfirmation} = useCreateEmptyReportConfirmation({
 *     policyID: 'policy123',
 *     policyName: 'Engineering Team',
 *     onConfirm: handleCreateReport,
 * });
 *
 */
export default function useCreateEmptyReportConfirmation({policyName, onConfirm, onCancel}: UseCreateEmptyReportConfirmationParams): UseCreateEmptyReportConfirmationResult {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const workspaceDisplayName = useMemo(() => (policyName?.trim().length ? policyName : translate('report.newReport.genericWorkspaceName')), [policyName, translate]);

    const handleReportsLinkPress = useCallback(() => {
        onCancel?.();
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT})}));
    }, [onCancel]);

    const openCreateReportConfirmation = useCallback(() => {
        const prompt = (
            <Text>
                {translate('report.newReport.emptyReportConfirmationPrompt', {workspaceName: workspaceDisplayName})}{' '}
                <TextLink onPress={handleReportsLinkPress}>{translate('report.newReport.emptyReportConfirmationPromptLink')}.</TextLink>
            </Text>
        );

        showConfirmModal({
            title: `${translate('report.newReport.emptyReportConfirmationTitle')} `, // Adding a space at the end because of this bug in react-native: https://github.com/facebook/react-native/issues/53286
            prompt,
            confirmText: translate('report.newReport.createReport'),
            cancelText: translate('common.cancel'),
        }).then(({action}) => {
            if (action === 'CONFIRM') {
                onConfirm();
                return;
            }
            onCancel?.();
        });
    }, [workspaceDisplayName, handleReportsLinkPress, translate, showConfirmModal, onConfirm, onCancel]);

    return {
        openCreateReportConfirmation,
    };
}
