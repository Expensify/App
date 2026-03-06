import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import useConfirmModal from './useConfirmModal';
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
};

function ConfirmationPrompt({workspaceName, checkboxRef, onLinkPress}: {workspaceName: string; checkboxRef: React.MutableRefObject<boolean>; onLinkPress: () => void}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isChecked, setIsChecked] = useState(false);

    return (
        <View style={styles.gap4}>
            <Text>
                {translate('report.newReport.emptyReportConfirmationPrompt', {workspaceName})}{' '}
                <TextLink onPress={onLinkPress}>{translate('report.newReport.emptyReportConfirmationPromptLink')}.</TextLink>
            </Text>
            <CheckboxWithLabel
                accessibilityLabel={translate('report.newReport.emptyReportConfirmationDontShowAgain')}
                label={translate('report.newReport.emptyReportConfirmationDontShowAgain')}
                isChecked={isChecked}
                onInputChange={(value) => {
                    const checked = !!value;
                    setIsChecked(checked);
                    // eslint-disable-next-line no-param-reassign
                    checkboxRef.current = checked;
                }}
            />
        </View>
    );
}

export default function useCreateEmptyReportConfirmation({policyName, onConfirm, onCancel}: UseCreateEmptyReportConfirmationParams): UseCreateEmptyReportConfirmationResult {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const workspaceDisplayName = policyName?.trim().length ? policyName : translate('report.newReport.genericWorkspaceName');

    const onConfirmRef = useRef(onConfirm);
    const onCancelRef = useRef(onCancel);
    useEffect(() => {
        onConfirmRef.current = onConfirm;
        onCancelRef.current = onCancel;
    }, [onConfirm, onCancel]);

    const openCreateReportConfirmation = () => {
        const checkboxRef = {current: false};

        const handleLinkPress = () => {
            onCancelRef.current?.();
            Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT})}));
        };

        showConfirmModal({
            title: `${translate('report.newReport.emptyReportConfirmationTitle')} `,
            confirmText: translate('report.newReport.createReport'),
            cancelText: translate('common.cancel'),
            prompt: (
                <ConfirmationPrompt
                    workspaceName={workspaceDisplayName}
                    checkboxRef={checkboxRef}
                    onLinkPress={handleLinkPress}
                />
            ),
        }).then((result) => {
            if (result.action === ModalActions.CONFIRM) {
                onConfirmRef.current(checkboxRef.current);
            } else {
                onCancelRef.current?.();
            }
        });
    };

    return {
        openCreateReportConfirmation,
    };
}
