import type {ReactNode} from 'react';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import ConfirmModal from '@components/ConfirmModal';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import useLocalize from './useLocalize';
import useThemeStyles from './useThemeStyles';

type UseCreateEmptyReportConfirmationParams = {
    /** The policy ID for which the report is being created */
    policyID?: string;
    /** The display name of the policy/workspace */
    policyName?: string;
    /** Callback function to execute when user confirms report creation */
    onConfirm: (shouldDismissEmptyReportsConfirmation: boolean) => void;
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
    const styles = useThemeStyles();
    const workspaceDisplayName = useMemo(() => (policyName?.trim().length ? policyName : translate('report.newReport.genericWorkspaceName')), [policyName, translate]);
    const [isVisible, setIsVisible] = useState(false);
    const [modalWorkspaceName, setModalWorkspaceName] = useState(workspaceDisplayName);
    const [shouldDismissEmptyReportsConfirmation, setShouldDismissEmptyReportsConfirmation] = useState(false);

    const handleConfirm = useCallback(() => {
        onConfirm(shouldDismissEmptyReportsConfirmation);
        setShouldDismissEmptyReportsConfirmation(false);
        setIsVisible(false);
    }, [onConfirm, shouldDismissEmptyReportsConfirmation]);

    const handleCancel = useCallback(() => {
        onCancel?.();
        setShouldDismissEmptyReportsConfirmation(false);
        setIsVisible(false);
    }, [onCancel]);

    const handleReportsLinkPress = useCallback(() => {
        onCancel?.();
        setShouldDismissEmptyReportsConfirmation(false);
        setIsVisible(false);
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT})}));
    }, [onCancel]);

    const openCreateReportConfirmation = useCallback(() => {
        // The caller is responsible for determining if empty report confirmation
        // should be shown. We simply open the modal when called.
        setModalWorkspaceName(workspaceDisplayName);
        setShouldDismissEmptyReportsConfirmation(false);
        setIsVisible(true);
    }, [workspaceDisplayName]);

    const prompt = useMemo(
        () => (
            <View style={styles.gap4}>
                <Text>
                    {translate('report.newReport.emptyReportConfirmationPrompt', {workspaceName: modalWorkspaceName})}{' '}
                    <TextLink onPress={handleReportsLinkPress}>{translate('report.newReport.emptyReportConfirmationPromptLink')}.</TextLink>
                </Text>
                <CheckboxWithLabel
                    accessibilityLabel={translate('report.newReport.emptyReportConfirmationDontShowAgain')}
                    label={translate('report.newReport.emptyReportConfirmationDontShowAgain')}
                    isChecked={shouldDismissEmptyReportsConfirmation}
                    onInputChange={(value) => setShouldDismissEmptyReportsConfirmation(!!value)}
                />
            </View>
        ),
        [handleReportsLinkPress, modalWorkspaceName, shouldDismissEmptyReportsConfirmation, styles.gap4, translate],
    );

    const CreateReportConfirmationModal = useMemo(
        () => (
            <ConfirmModal
                confirmText={translate('report.newReport.createReport')}
                cancelText={translate('common.cancel')}
                isVisible={isVisible}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                prompt={prompt}
                title={`${translate('report.newReport.emptyReportConfirmationTitle')} `} // Adding a space at the end because of this bug in react-native: https://github.com/facebook/react-native/issues/53286
            />
        ),
        [handleCancel, handleConfirm, isVisible, prompt, translate],
    );

    return {
        openCreateReportConfirmation,
        CreateReportConfirmationModal,
    };
}
