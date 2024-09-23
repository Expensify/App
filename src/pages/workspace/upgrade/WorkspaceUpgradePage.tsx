import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import CONST from '@src/CONST';
import * as Policy from '@src/libs/actions/Policy/Policy';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import UpgradeConfirmation from './UpgradeConfirmation';
import UpgradeIntro from './UpgradeIntro';

type WorkspaceUpgradePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.UPGRADE>;

function WorkspaceUpgradePage({route}: WorkspaceUpgradePageProps) {
    const navigation = useNavigation();
    const styles = useThemeStyles();
    const policyID = route.params.policyID;
    const feature = Object.values(CONST.UPGRADE_FEATURE_INTRO_MAPPING).find((f) => f.alias === route.params.featureName);
    const {translate} = useLocalize();
    const [policy] = useOnyx(`policy_${policyID}`);
    const {isOffline} = useNetwork();

    const canPerformUpgrade = !!feature && !!policy && PolicyUtils.isPolicyAdmin(policy);
    const isUpgraded = React.useMemo(() => PolicyUtils.isControlPolicy(policy), [policy]);

    const goBack = useCallback(() => {
        if (!feature) {
            return;
        }
        switch (feature.id) {
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.reportFields.id:
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.rules.id:
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCards.id:
                return Navigation.navigate(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID));
            default:
                return route.params.backTo ? Navigation.navigate(route.params.backTo) : Navigation.goBack();
        }
    }, [feature, policyID, route.params.backTo]);

    const upgradeToCorporate = () => {
        if (!canPerformUpgrade) {
            return;
        }

        Policy.upgradeToCorporate(policy.id, feature.name);
    };

    const confirmUpgrade = useCallback(() => {
        if (!feature) {
            return;
        }
        switch (feature.id) {
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.reportFields.id:
                Policy.enablePolicyReportFields(policyID, true, true);
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.rules.id:
                Policy.enablePolicyRules(policyID, true, true);
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCards.id:
                Policy.enableCompanyCards(policyID, true);
                break;
            default:
        }
    }, [feature, policyID]);

    useEffect(() => {
        const unsubscribeListener = navigation.addListener('blur', () => {
            if (!isUpgraded || !canPerformUpgrade) {
                return;
            }
            confirmUpgrade();
        });

        return unsubscribeListener;
    }, [isUpgraded, canPerformUpgrade, confirmUpgrade, navigation]);

    if (!canPerformUpgrade) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator
            testID="workspaceUpgradePage"
            offlineIndicatorStyle={styles.mtAuto}
        >
            <HeaderWithBackButton
                title={translate('common.upgrade')}
                onBackButtonPress={() => {
                    if (isUpgraded) {
                        Navigation.dismissModal();
                        goBack();
                    } else {
                        Navigation.goBack();
                    }
                }}
            />
            {isUpgraded && (
                <UpgradeConfirmation
                    onConfirmUpgrade={() => {
                        Navigation.dismissModal();
                        goBack();
                    }}
                    policyName={policy.name}
                />
            )}
            {!isUpgraded && (
                <UpgradeIntro
                    feature={feature}
                    onUpgrade={upgradeToCorporate}
                    buttonDisabled={isOffline}
                    loading={policy.isPendingUpgrade}
                />
            )}
        </ScreenWrapper>
    );
}

export default WorkspaceUpgradePage;
