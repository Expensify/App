import React, {useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {WorkspaceConfirmationSubmitFunctionParams} from '@components/WorkspaceConfirmationForm';
import WorkspaceConfirmationForm from '@components/WorkspaceConfirmationForm';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import UpgradeConfirmation from '@pages/workspace/upgrade/UpgradeConfirmation';
import UpgradeIntro from '@pages/workspace/upgrade/UpgradeIntro';
import CONST from '@src/CONST';
import {createDraftWorkspace, createWorkspace} from '@src/libs/actions/Policy/Policy';

function TravelUpgrade() {
    const styles = useThemeStyles();
    const feature = CONST.UPGRADE_FEATURE_INTRO_MAPPING.travel;
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const [isUpgraded, setIsUpgraded] = useState(false);
    const [shouldShowConfirmation, setShouldShowConfirmation] = useState(false);

    const onSubmit = (params: WorkspaceConfirmationSubmitFunctionParams) => {
        createDraftWorkspace('', false, params.name, params.policyID, params.currency, params.avatarFile as File);
        setShouldShowConfirmation(false);
        setIsUpgraded(true);
        createWorkspace('', false, params.name, params.policyID, '', params.currency, params.avatarFile as File);
    };

    if (shouldShowConfirmation) {
        return <WorkspaceConfirmationForm onSubmit={onSubmit} />;
    }

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator
            testID={TravelUpgrade.displayName}
            offlineIndicatorStyle={styles.mtAuto}
        >
            <HeaderWithBackButton
                title={translate('common.upgrade')}
                onBackButtonPress={() => {
                    Navigation.goBack();
                }}
            />
            {!!isUpgraded && (
                <UpgradeConfirmation
                    onConfirmUpgrade={() => Navigation.goBack()}
                    policyName=""
                    isTravelUpgrade
                />
            )}
            {!isUpgraded && (
                <UpgradeIntro
                    feature={feature}
                    onUpgrade={() => setShouldShowConfirmation(true)}
                    buttonDisabled={isOffline}
                    loading={false}
                    isCategorizing
                />
            )}
        </ScreenWrapper>
    );
}

TravelUpgrade.displayName = 'TravelUpgrade';

export default TravelUpgrade;
