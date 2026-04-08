import React, {useMemo, useState} from 'react';
import FixedFooter from '@components/FixedFooter';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {syncGusto, updateGustoApprovalMode} from '@libs/actions/connections/Gusto';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {GustoApprovalMode} from '../types';

type GustoApprovalModePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.HR_GUSTO_APPROVAL_MODE>;

type ApprovalModeItem = ListItem & {
    value: GustoApprovalMode;
};

function GustoApprovalModePage({route}: GustoApprovalModePageProps) {
    const {policyID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);
    const currentApprovalMode = policy?.connections?.gusto?.config?.approvalMode ?? CONST.GUSTO.APPROVAL_MODE.BASIC;
    const [selectedApprovalMode, setSelectedApprovalMode] = useState<GustoApprovalMode>(currentApprovalMode);
    const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);

    const approvalModeItems = useMemo<ApprovalModeItem[]>(
        () => [
            {
                text: translate('workspace.hr.gusto.approvalModes.basic'),
                keyForList: CONST.GUSTO.APPROVAL_MODE.BASIC,
                value: CONST.GUSTO.APPROVAL_MODE.BASIC,
                isSelected: selectedApprovalMode === CONST.GUSTO.APPROVAL_MODE.BASIC,
            },
            {
                text: translate('workspace.hr.gusto.approvalModes.manager'),
                keyForList: CONST.GUSTO.APPROVAL_MODE.MANAGER,
                value: CONST.GUSTO.APPROVAL_MODE.MANAGER,
                isSelected: selectedApprovalMode === CONST.GUSTO.APPROVAL_MODE.MANAGER,
            },
            {
                text: translate('workspace.hr.gusto.approvalModes.custom'),
                keyForList: CONST.GUSTO.APPROVAL_MODE.CUSTOM,
                value: CONST.GUSTO.APPROVAL_MODE.CUSTOM,
                isSelected: selectedApprovalMode === CONST.GUSTO.APPROVAL_MODE.CUSTOM,
            },
        ],
        [selectedApprovalMode, translate],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="GustoApprovalModePage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.hr.gusto.approvalMode')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_HR.getRoute(policyID))}
                />
                <SelectionList<ApprovalModeItem>
                    data={approvalModeItems}
                    onSelectRow={(item) => setSelectedApprovalMode(item.value)}
                    ListItem={RadioListItem}
                    initiallyFocusedItemKey={selectedApprovalMode}
                    customListHeaderContent={<Text style={[styles.mh5, styles.mv3]}>{translate('workspace.hr.gusto.approvalModeDescription')}</Text>}
                    footerContent={
                        <FixedFooter>
                            <Button
                                text={translate('common.save')}
                                onPress={() => setIsWarningModalVisible(true)}
                                isDisabled={selectedApprovalMode === currentApprovalMode}
                            />
                        </FixedFooter>
                    }
                />
                <ConfirmModal
                    title={translate('workspace.hr.gusto.approvalModeWarningModal.title')}
                    isVisible={isWarningModalVisible}
                    onConfirm={() => {
                        setIsWarningModalVisible(false);
                        updateGustoApprovalMode(policyID, selectedApprovalMode, currentApprovalMode);
                        syncGusto(policy);
                        Navigation.goBack(ROUTES.WORKSPACE_HR.getRoute(policyID));
                    }}
                    onCancel={() => setIsWarningModalVisible(false)}
                    prompt={translate('workspace.hr.gusto.approvalModeWarningModal.prompt')}
                    confirmText={translate('workspace.hr.gusto.approvalModeWarningModal.confirmText')}
                    cancelText={translate('common.cancel')}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default GustoApprovalModePage;
