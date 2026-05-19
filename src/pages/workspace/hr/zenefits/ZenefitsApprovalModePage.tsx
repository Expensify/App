import React, {useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
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
import {updateZenefitsApprovalMode} from '@libs/actions/connections/Zenefits';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isZenefitsConnected} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ApprovalMode = ValueOf<typeof CONST.ZENEFITS.APPROVAL_MODE>;
type ZenefitsApprovalModePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.HR_ZENEFITS_APPROVAL_MODE>;
type ApprovalModeListItem = ListItem & {
    value: ApprovalMode;
};

function ZenefitsApprovalModePage({
    route: {
        params: {policyID},
    },
}: ZenefitsApprovalModePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const {showConfirmModal} = useConfirmModal();
    const policy = usePolicy(policyID);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const currentApprovalMode = policy?.connections?.zenefits?.config?.approvalMode ?? undefined;
    const [draftApprovalMode, setDraftApprovalMode] = useState<ApprovalMode | undefined>();
    const selectedApprovalMode = draftApprovalMode ?? currentApprovalMode;
    const isSaveDisabled = !draftApprovalMode || draftApprovalMode === currentApprovalMode;
    const approvalModeOptions: ApprovalModeListItem[] = [
        {
            text: translate('workspace.hr.zenefits.approvalModes.basic.label'),
            alternateText: translate('workspace.hr.zenefits.approvalModes.basic.description'),
            keyForList: CONST.ZENEFITS.APPROVAL_MODE.BASIC,
            value: CONST.ZENEFITS.APPROVAL_MODE.BASIC,
            isSelected: selectedApprovalMode === CONST.ZENEFITS.APPROVAL_MODE.BASIC,
        },
        {
            text: translate('workspace.hr.zenefits.approvalModes.manager.label'),
            alternateText: translate('workspace.hr.zenefits.approvalModes.manager.description'),
            keyForList: CONST.ZENEFITS.APPROVAL_MODE.MANAGER,
            value: CONST.ZENEFITS.APPROVAL_MODE.MANAGER,
            isSelected: selectedApprovalMode === CONST.ZENEFITS.APPROVAL_MODE.MANAGER,
        },
        {
            text: translate('workspace.hr.zenefits.approvalModes.custom.label'),
            alternateText: translate('workspace.hr.zenefits.approvalModes.custom.description'),
            keyForList: CONST.ZENEFITS.APPROVAL_MODE.CUSTOM,
            value: CONST.ZENEFITS.APPROVAL_MODE.CUSTOM,
            isSelected: selectedApprovalMode === CONST.ZENEFITS.APPROVAL_MODE.CUSTOM,
        },
    ];
    const selectedApprovalModeKey = approvalModeOptions.find((approvalMode) => approvalMode.isSelected)?.keyForList;

    const selectApprovalMode = (approvalMode: ApprovalMode) => {
        setDraftApprovalMode(approvalMode);
    };

    const confirmAndSave = () => {
        if (!draftApprovalMode) {
            return;
        }

        showConfirmModal({
            title: translate('workspace.hr.zenefits.approvalModeWarningTitle'),
            prompt: <RenderHTML html={translate('workspace.hr.zenefits.approvalModeWarningPrompt', CONST.CONFIGURE_APPROVAL_WORKFLOWS_HELP_URL)} />,
            confirmText: translate('workspace.hr.zenefits.approvalModeWarningConfirm'),
            cancelText: translate('common.cancel'),
        }).then(({action}) => {
            if (action !== ModalActions.CONFIRM) {
                return;
            }
            updateZenefitsApprovalMode(policyID, draftApprovalMode, currentApprovalMode, connectionSyncProgress);
            Navigation.goBack(ROUTES.WORKSPACE_HR.getRoute(policyID));
        });
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.ZENEFITS) || (!!policy && !isZenefitsConnected(policy))}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="ZenefitsApprovalModePage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.hr.zenefits.approvalMode')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_HR.getRoute(policyID))}
                />
                <View style={styles.flex1}>
                    <Text style={[styles.textSupporting, styles.ph5, styles.mt3, styles.mb3]}>{translate('workspace.hr.zenefits.approvalModeDescription')}</Text>
                    <SelectionList
                        data={approvalModeOptions}
                        ListItem={SingleSelectListItem}
                        onSelectRow={(option) => selectApprovalMode(option.value)}
                        shouldSingleExecuteRowSelect
                        initiallyFocusedItemKey={selectedApprovalModeKey}
                        alternateNumberOfSupportedLines={3}
                        showScrollIndicator={false}
                    />
                    <FixedFooter style={styles.mtAuto}>
                        <Button
                            large
                            success
                            text={translate('common.save')}
                            onPress={confirmAndSave}
                            isDisabled={isSaveDisabled}
                        />
                    </FixedFooter>
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default ZenefitsApprovalModePage;
