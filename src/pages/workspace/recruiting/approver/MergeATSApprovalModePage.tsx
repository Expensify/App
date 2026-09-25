import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateMergeApprovalMode} from '@libs/actions/connections/merge';
import {getMergeFinalApprover, isMergeConnected} from '@libs/merge/MergeUtils';
import {getConnectedATSProvider, getMergeATSApprovalMode, getMergeATSApproverField} from '@libs/merge/RecruitingUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MergeATSApprovalNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {getApproverFieldName} from '@pages/workspace/recruiting/utils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {MergeApprovalMode} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

import {useMergeATSApprovalDraftActions, useMergeATSApprovalDraftState} from './MergeATSApprovalDraftContext';
import MergeATSFinalApproverMenuItem from './MergeATSFinalApproverMenuItem';

type MergeATSApprovalModePageProps = PlatformStackScreenProps<MergeATSApprovalNavigatorParamList, typeof SCREENS.WORKSPACE.RECRUITING_MERGE_APPROVAL_MODE>;

type ApprovalModeListItem = ListItem & {
    value: MergeApprovalMode;
};

function MergeATSApprovalModePage({
    route: {
        params: {policyID},
    },
}: MergeATSApprovalModePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {showConfirmModal} = useConfirmModal();
    const {isBetaEnabled} = usePermissions();
    const policy = usePolicy(policyID);

    const providerName = getConnectedATSProvider(policy)?.displayName ?? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.merge_ats;
    const currentApprovalMode = getMergeATSApprovalMode(policy);
    const {approvalMode: selectedApprovalMode, approverField, finalApprover} = useMergeATSApprovalDraftState(policyID);
    const {setDraftApprovalMode} = useMergeATSApprovalDraftActions();

    // Advanced mode always has an approver field, since that one falls back to the recruiter field, and its final approver is optional.
    const isApproverMissing = selectedApprovalMode === CONST.MERGE.APPROVAL_MODE.BASIC && !finalApprover;

    const approvalModeOptions: ApprovalModeListItem[] = [
        {
            text: translate('workspace.merge.approvalModes.basic'),
            alternateText: translate('workspace.recruiting.approvalModeDescriptions.basic'),
            keyForList: CONST.MERGE.APPROVAL_MODE.BASIC,
            value: CONST.MERGE.APPROVAL_MODE.BASIC,
            isSelected: selectedApprovalMode === CONST.MERGE.APPROVAL_MODE.BASIC,
        },
        {
            text: translate('workspace.merge.approvalModes.advanced'),
            alternateText: translate('workspace.recruiting.approvalModeDescriptions.advanced'),
            keyForList: CONST.MERGE.APPROVAL_MODE.ADVANCED,
            value: CONST.MERGE.APPROVAL_MODE.ADVANCED,
            isSelected: selectedApprovalMode === CONST.MERGE.APPROVAL_MODE.ADVANCED,
        },
        {
            text: translate('workspace.merge.approvalModes.custom'),
            alternateText: translate('workspace.recruiting.approvalModeDescriptions.custom'),
            keyForList: CONST.MERGE.APPROVAL_MODE.CUSTOM,
            value: CONST.MERGE.APPROVAL_MODE.CUSTOM,
            isSelected: selectedApprovalMode === CONST.MERGE.APPROVAL_MODE.CUSTOM,
        },
    ];

    const saveApprovalMode = () => {
        if (!selectedApprovalMode) {
            return;
        }

        updateMergeApprovalMode({
            policyID,
            connectionName: CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS,
            approvalMode: selectedApprovalMode,
            currentApprovalMode,
            currentApproverField: getMergeATSApproverField(policy),
            currentFinalApprover: getMergeFinalApprover(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS),
            ...(selectedApprovalMode === CONST.MERGE.APPROVAL_MODE.ADVANCED && {approverField}),
            ...(selectedApprovalMode !== CONST.MERGE.APPROVAL_MODE.CUSTOM && {finalApprover}),
        });

        Navigation.goBack();
    };

    const confirmSaveApprovalMode = () => {
        // Only leaving custom replaces the approval routing the admin set up by hand, so that is the only change worth warning about.
        const shouldConfirm = currentApprovalMode === CONST.MERGE.APPROVAL_MODE.CUSTOM && selectedApprovalMode !== CONST.MERGE.APPROVAL_MODE.CUSTOM;
        if (!shouldConfirm) {
            saveApprovalMode();
            return;
        }

        showConfirmModal({
            title: translate('workspace.merge.approvalModeWarningTitle'),
            prompt: (
                <View style={[styles.renderHTML, styles.flexRow]}>
                    <RenderHTML html={translate('workspace.merge.approvalModeWarningPrompt', providerName, CONST.CONFIGURE_APPROVAL_WORKFLOWS_HELP_URL)} />
                </View>
            ),
            confirmText: translate('workspace.merge.approvalModeWarningConfirm'),
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
            featureName={CONST.POLICY.MORE_FEATURES.IS_RECRUITING_ENABLED}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.MERGE_ATS) || (!!policy && !isMergeConnected(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS))}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="MergeATSApprovalModePage"
            >
                <HeaderWithBackButton title={translate('workspace.recruiting.defaultApprover')} />
                <View style={styles.flex1}>
                    <Text style={[styles.textSupporting, styles.ph5, styles.mb3]}>{translate('workspace.recruiting.approvalModeDescription', providerName)}</Text>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {approvalModeOptions.map((option) => (
                            <React.Fragment key={option.keyForList}>
                                <SingleSelectListItem
                                    item={option}
                                    showTooltip={false}
                                    onSelectRow={() => setDraftApprovalMode(option.value)}
                                    isAlternateTextMultilineSupported
                                    alternateTextNumberOfLines={3}
                                />
                                {option.value === selectedApprovalMode && selectedApprovalMode === CONST.MERGE.APPROVAL_MODE.BASIC && (
                                    <>
                                        <MergeATSFinalApproverMenuItem
                                            policyID={policyID}
                                            description={translate('common.approver')}
                                        />
                                        <View style={styles.dividerLine} />
                                    </>
                                )}
                                {option.value === selectedApprovalMode && selectedApprovalMode === CONST.MERGE.APPROVAL_MODE.ADVANCED && (
                                    <>
                                        <MenuItemWithTopDescription
                                            shouldShowRightIcon
                                            description={translate('workspace.recruiting.approverField')}
                                            title={getApproverFieldName(approverField, translate)}
                                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_RECRUITING_MERGE_APPROVER_FIELD.getRoute(policyID))}
                                        />
                                        <MergeATSFinalApproverMenuItem
                                            policyID={policyID}
                                            description={translate('workspace.recruiting.finalApproverOptional')}
                                        />
                                        <View style={styles.dividerLine} />
                                    </>
                                )}
                            </React.Fragment>
                        ))}
                    </ScrollView>
                    <FixedFooter
                        style={styles.mtAuto}
                        addBottomSafeAreaPadding
                    >
                        <Button
                            size={CONST.BUTTON_SIZE.LARGE}
                            variant={CONST.BUTTON_VARIANT.SUCCESS}
                            onPress={confirmSaveApprovalMode}
                            isDisabled={!selectedApprovalMode || isApproverMissing}
                        >
                            <Button.Text>{translate('common.save')}</Button.Text>
                        </Button>
                    </FixedFooter>
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default MergeATSApprovalModePage;
