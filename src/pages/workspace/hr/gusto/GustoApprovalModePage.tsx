import React, {useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateGustoApprovalMode} from '@libs/actions/connections/Gusto';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isGustoConnected} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type ApprovalMode = ValueOf<typeof CONST.GUSTO.APPROVAL_MODE>;
type GustoApprovalModePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.HR_GUSTO_APPROVAL_MODE>;
type ApprovalModeListItem = ListItem & {
    value: ApprovalMode;
};

function GustoApprovalModePage({
    route: {
        params: {policyID},
    },
}: GustoApprovalModePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const policy = usePolicy(policyID);
    const currentApprovalMode = policy?.connections?.gusto?.config?.approvalMode ?? undefined;
    const [draftApprovalMode, setDraftApprovalMode] = useState<ApprovalMode | undefined>();
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const selectedApprovalMode = draftApprovalMode ?? currentApprovalMode;
    const isSaveDisabled = !draftApprovalMode || draftApprovalMode === currentApprovalMode;
    const approvalModeOptions: ApprovalModeListItem[] = [
        {
            text: translate('workspace.hr.gusto.approvalModes.basic.label'),
            alternateText: translate('workspace.hr.gusto.approvalModes.basic.description'),
            keyForList: CONST.GUSTO.APPROVAL_MODE.BASIC,
            value: CONST.GUSTO.APPROVAL_MODE.BASIC,
            isSelected: selectedApprovalMode === CONST.GUSTO.APPROVAL_MODE.BASIC,
        },
        {
            text: translate('workspace.hr.gusto.approvalModes.manager.label'),
            alternateText: translate('workspace.hr.gusto.approvalModes.manager.description'),
            keyForList: CONST.GUSTO.APPROVAL_MODE.MANAGER,
            value: CONST.GUSTO.APPROVAL_MODE.MANAGER,
            isSelected: selectedApprovalMode === CONST.GUSTO.APPROVAL_MODE.MANAGER,
        },
        {
            text: translate('workspace.hr.gusto.approvalModes.custom.label'),
            alternateText: translate('workspace.hr.gusto.approvalModes.custom.description'),
            keyForList: CONST.GUSTO.APPROVAL_MODE.CUSTOM,
            value: CONST.GUSTO.APPROVAL_MODE.CUSTOM,
            isSelected: selectedApprovalMode === CONST.GUSTO.APPROVAL_MODE.CUSTOM,
        },
    ];
    const selectedApprovalModeKey = approvalModeOptions.find((approvalMode) => approvalMode.isSelected)?.keyForList;

    const selectApprovalMode = (approvalMode: ApprovalMode) => {
        setDraftApprovalMode(approvalMode);
    };

    const saveApprovalMode = () => {
        if (!draftApprovalMode) {
            return;
        }

        updateGustoApprovalMode(policyID, draftApprovalMode, currentApprovalMode);
        setIsWarningModalOpen(false);
        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.GUSTO) || (!!policy && !isGustoConnected(policy))}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="GustoApprovalModePage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.hr.gusto.approvalMode')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <View style={styles.flex1}>
                    <Text style={[styles.textSupporting, styles.ph5, styles.mt3, styles.mb3]}>{translate('workspace.hr.gusto.approvalModeDescription')}</Text>
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
                            onPress={() => setIsWarningModalOpen(true)}
                            isDisabled={isSaveDisabled}
                        />
                    </FixedFooter>
                </View>
                <ConfirmModal
                    title={translate('workspace.hr.gusto.approvalModeWarningTitle')}
                    isVisible={isWarningModalOpen}
                    onConfirm={saveApprovalMode}
                    onCancel={() => setIsWarningModalOpen(false)}
                    prompt={<RenderHTML html={translate('workspace.hr.gusto.approvalModeWarningPrompt', CONST.CONFIGURE_APPROVAL_WORKFLOWS_HELP_URL)} />}
                    confirmText={translate('workspace.hr.gusto.approvalModeWarningConfirm')}
                    cancelText={translate('common.cancel')}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default GustoApprovalModePage;
