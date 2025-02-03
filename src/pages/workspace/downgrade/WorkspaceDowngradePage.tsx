import React, {useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCompanyFeeds} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {canModifyPlan, getWorkspaceAccountID, isCollectPolicy} from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import {downgradeToTeam} from '@src/libs/actions/Policy/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import DowngradeConfirmation from './DowngradeConfirmation';
import DowngradeIntro from './DowngradeIntro';

type WorkspaceDowngradePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DOWNGRADE>;

function WorkspaceDowngradePage({route}: WorkspaceDowngradePageProps) {
    const styles = useThemeStyles();
    const policyID = route.params?.policyID;
    const workspaceAccountID = getWorkspaceAccountID(policyID);
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const {isOffline} = useNetwork();
    const [isDowngradeWarningModalOpen, setIsDowngradeWarningModalOpen] = useState(false);

    const canPerformDowngrade = useMemo(() => canModifyPlan(policyID), [policyID]);
    const isDowngraded = useMemo(() => isCollectPolicy(policy), [policy]);

    const onDowngradeToTeam = () => {
        if (!canPerformDowngrade || !policy) {
            return;
        }
        if (Object.keys(companyFeeds).length > 1) {
            setIsDowngradeWarningModalOpen(true);
            return;
        }
        downgradeToTeam(policy.id);
    };

    const onClose = () => {
        setIsDowngradeWarningModalOpen(false);
        Navigation.dismissModal();
    };

    if (!canPerformDowngrade) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator
            testID="workspaceDowngradePage"
            offlineIndicatorStyle={styles.mtAuto}
        >
            <HeaderWithBackButton
                title={translate('common.downgradeWorkspace')}
                onBackButtonPress={() => {
                    if (isDowngraded) {
                        Navigation.dismissModal();
                    } else {
                        Navigation.goBack();
                    }
                }}
            />
            {isDowngraded && !!policyID && (
                <DowngradeConfirmation
                    onConfirmDowngrade={() => {
                        Navigation.dismissModal();
                    }}
                    policyID={policyID}
                />
            )}
            {!isDowngraded && (
                <DowngradeIntro
                    policyID={policyID}
                    onDowngrade={onDowngradeToTeam}
                    buttonDisabled={isOffline}
                    loading={policy?.isPendingDowngrade}
                />
            )}
            <ConfirmModal
                title={translate('workspace.moreFeatures.companyCards.downgradeTitle')}
                isVisible={isDowngradeWarningModalOpen}
                onConfirm={onClose}
                shouldShowCancelButton={false}
                onCancel={onClose}
                prompt={translate('workspace.moreFeatures.companyCards.downgradeSubTitle')}
                confirmText={translate('common.buttonConfirm')}
            />
        </ScreenWrapper>
    );
}

export default WorkspaceDowngradePage;
