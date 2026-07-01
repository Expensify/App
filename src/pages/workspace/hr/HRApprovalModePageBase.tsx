import React, {useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Button from '@components/ButtonComposed';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Beta from '@src/types/onyx/Beta';
import type Policy from '@src/types/onyx/Policy';
import type {PolicyConnectionSyncProgress} from '@src/types/onyx/Policy';

type ApprovalModeValue = ValueOf<typeof CONST.GUSTO.APPROVAL_MODE> | ValueOf<typeof CONST.ZENEFITS.APPROVAL_MODE> | ValueOf<typeof CONST.MERGE_HR.APPROVAL_MODE>;

type HRApprovalModeProviderConfig<T extends ApprovalModeValue = ApprovalModeValue> = {
    testID: string;
    beta?: Beta;
    isConnected: (policy: OnyxEntry<Policy>) => boolean;
    approvalModes: {BASIC: T; MANAGER: T; CUSTOM: T};
    getCurrentApprovalMode: (policy: OnyxEntry<Policy>) => T | null;
    getProviderName: (policy: OnyxEntry<Policy>) => string;
    getHeaderTitle: (providerName: string) => string;
    handleSave: (params: {policyID: string; draftApprovalMode: T; currentApprovalMode: T | null; connectionSyncProgress?: OnyxEntry<PolicyConnectionSyncProgress>}) => void;
};

type ApprovalModeListItem<T extends ApprovalModeValue = ApprovalModeValue> = ListItem & {
    value: T;
};

type HRApprovalModePageBaseProps<T extends ApprovalModeValue = ApprovalModeValue> = {
    policyID: string;
    config: HRApprovalModeProviderConfig<T>;
};

function HRApprovalModePageBase<T extends ApprovalModeValue>({policyID, config}: HRApprovalModePageBaseProps<T>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {showConfirmModal} = useConfirmModal();
    const {isBetaEnabled} = usePermissions();
    const policy = usePolicy(policyID);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);

    const providerName = config.getProviderName(policy);
    const currentApprovalMode = config.getCurrentApprovalMode(policy);
    const [draftApprovalMode, setDraftApprovalMode] = useState<T | undefined>();
    const selectedApprovalMode = draftApprovalMode ?? currentApprovalMode;
    const isSaveDisabled = !draftApprovalMode || draftApprovalMode === currentApprovalMode;

    const approvalModeOptions: Array<ApprovalModeListItem<T>> = [
        {
            text: translate('workspace.hr.approvalModes.basic.label'),
            alternateText: translate('workspace.hr.approvalModes.basic.description'),
            keyForList: config.approvalModes.BASIC,
            value: config.approvalModes.BASIC,
            isSelected: selectedApprovalMode === config.approvalModes.BASIC,
        },
        {
            text: translate('workspace.hr.approvalModes.manager.label'),
            alternateText: translate('workspace.hr.approvalModes.manager.description', providerName),
            keyForList: config.approvalModes.MANAGER,
            value: config.approvalModes.MANAGER,
            isSelected: selectedApprovalMode === config.approvalModes.MANAGER,
        },
        {
            text: translate('workspace.hr.approvalModes.custom.label'),
            alternateText: translate('workspace.hr.approvalModes.custom.description'),
            keyForList: config.approvalModes.CUSTOM,
            value: config.approvalModes.CUSTOM,
            isSelected: selectedApprovalMode === config.approvalModes.CUSTOM,
        },
    ];
    const selectedApprovalModeKey = approvalModeOptions.find((option) => option.isSelected)?.keyForList;

    const saveApprovalMode = () => {
        if (!draftApprovalMode) {
            return;
        }

        config.handleSave({policyID, draftApprovalMode, currentApprovalMode, connectionSyncProgress});
        Navigation.goBack();
    };

    const confirmSaveApprovalMode = () => {
        showConfirmModal({
            title: translate('workspace.hr.approvalModeWarningTitle'),
            prompt: (
                <View style={[styles.renderHTML, styles.flexRow]}>
                    <RenderHTML html={translate('workspace.hr.approvalModeWarningPrompt', providerName, CONST.CONFIGURE_APPROVAL_WORKFLOWS_HELP_URL)} />
                </View>
            ),
            confirmText: translate('workspace.hr.approvalModeWarningConfirm'),
            cancelText: translate('common.cancel'),
        }).then((result) => {
            if (result?.action !== ModalActions.CONFIRM) {
                return;
            }
            saveApprovalMode();
        });
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED}
            shouldBeBlocked={(!!config.beta && !isBetaEnabled(config.beta)) || (!!policy && !config.isConnected(policy))}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID={config.testID}
            >
                <HeaderWithBackButton
                    title={config.getHeaderTitle(providerName)}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <View style={styles.flex1}>
                    <Text style={[styles.textSupporting, styles.ph5, styles.mt3, styles.mb3]}>{translate('workspace.hr.approvalModeDescription', providerName)}</Text>
                    <SelectionList
                        data={approvalModeOptions}
                        ListItem={SingleSelectListItem}
                        onSelectRow={(option) => setDraftApprovalMode(option.value)}
                        shouldSingleExecuteRowSelect
                        initiallyFocusedItemKey={selectedApprovalModeKey}
                        alternateNumberOfSupportedLines={3}
                        showScrollIndicator={false}
                    />
                    <FixedFooter
                        style={styles.mtAuto}
                        addBottomSafeAreaPadding
                    >
                        <Button
                            size={CONST.BUTTON_SIZE.LARGE}
                            variant="success"
                            onPress={confirmSaveApprovalMode}
                            isDisabled={isSaveDisabled}
                        >
                            <Button.Text>{translate('common.save')}</Button.Text>
                        </Button>
                    </FixedFooter>
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default HRApprovalModePageBase;
export type {HRApprovalModeProviderConfig};
