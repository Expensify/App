import React, {useCallback, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import useLocalize from './useLocalize';

type UseCreateEmptyReportConfirmationParams = {
    /** The policy ID for which the report is being created */
    policyID?: string;
    /** The display name of the policy/workspace */
    policyName?: string;
    /** Callback function to execute when user confirms report creation */
    onConfirm: () => void | Promise<void>;
    /** Optional callback function to execute when user cancels the confirmation */
    onCancel?: () => void;
};

type UseCreateEmptyReportConfirmationResult = {
    /** Function to open the confirmation modal */
    openCreateReportConfirmation: () => void;
    /** The confirmation modal React component to render */
    CreateReportConfirmationModal: ReactNode;
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
 *          - CreateReportConfirmationModal: The confirmation modal React component to render
 *
 * @example
 * const {openCreateReportConfirmation, CreateReportConfirmationModal} = useCreateEmptyReportConfirmation({
 *     policyID: 'policy123',
 *     policyName: 'Engineering Team',
 *     onConfirm: handleCreateReport,
 * });
 *
 */
export default function useCreateEmptyReportConfirmation({policyName, onConfirm, onCancel}: UseCreateEmptyReportConfirmationParams): UseCreateEmptyReportConfirmationResult {
    const {translate} = useLocalize();
    const [isVisible, setIsVisible] = useState(false);
    const [isConfirmLoading, setIsConfirmLoading] = useState(false);

    const workspaceDisplayName = useMemo(() => (policyName?.trim().length ? policyName : translate('report.newReport.genericWorkspaceName')), [policyName, translate]);

    const handleConfirm = useCallback(() => {
        if (isConfirmLoading) {
            return;
        }

        setIsConfirmLoading(true);

        const result = onConfirm();

        // If the result is not a Promise, convert it to one for consistent handling
        const resultPromise = result instanceof Promise ? result : Promise.resolve();

        resultPromise
            .catch(() => {})
            .finally(() => {
                setIsConfirmLoading(false);
                setIsVisible(false);
            });
    }, [isConfirmLoading, onConfirm]);

    const handleCancel = useCallback(() => {
        if (isConfirmLoading) {
            return;
        }

        setIsVisible(false);
        onCancel?.();
    }, [isConfirmLoading, onCancel]);

    const handleReportsLinkPress = useCallback(() => {
        setIsVisible(false);
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery({groupBy: CONST.SEARCH.GROUP_BY.REPORTS})}));
    }, []);

    const openCreateReportConfirmation = useCallback(() => {
        // The caller is responsible for determining if empty report confirmation
        // should be shown. We simply open the modal when called.
        setIsVisible(true);
    }, []);

    const prompt = useMemo(
        () => (
            <Text>
                {translate('report.newReport.emptyReportWarningPrompt', {workspaceName: workspaceDisplayName})}{' '}
                <TextLink onPress={handleReportsLinkPress}>{translate('report.newReport.emptyReportWarningPromptLink')}</TextLink>
                {translate('report.newReport.emptyReportWarningPromptSuffix')}
            </Text>
        ),
        [handleReportsLinkPress, translate, workspaceDisplayName],
    );

    const CreateReportConfirmationModal = useMemo(
        () => (
            <ConfirmModal
                confirmText={translate('report.newReport.warningConfirm')}
                cancelText={translate('report.newReport.warningCancel')}
                isVisible={isVisible}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                prompt={prompt}
                title={translate('report.newReport.emptyReportWarningTitle')}
                isConfirmLoading={isConfirmLoading}
            />
        ),
        [handleCancel, handleConfirm, isConfirmLoading, isVisible, prompt, translate],
    );

    return {
        openCreateReportConfirmation,
        CreateReportConfirmationModal,
    };
}
