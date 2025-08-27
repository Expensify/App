import React, {useCallback, useMemo, useRef, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import type CreateWorkspaceParams from '@libs/API/parameters/CreateWorkspaceParams';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import UpgradeConfirmation from '@pages/workspace/upgrade/UpgradeConfirmation';
import UpgradeIntro from '@pages/workspace/upgrade/UpgradeIntro';
import {setMoneyRequestParticipants} from '@userActions/IOU';
import CONST from '@src/CONST';
import * as Policy from '@src/libs/actions/Policy/Policy';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

const DEFAULT_FEATURE_NAME = 'categories';

type IOURequestStepUpgradeProps = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.STEP_UPGRADE>;

function IOURequestStepUpgrade({
    route: {
        params: {transactionID, action, featureName},
    },
}: IOURequestStepUpgradeProps) {
    const styles = useThemeStyles();
    const featureNameAlias = featureName ?? DEFAULT_FEATURE_NAME;
    const feature = useMemo(
        () =>
            Object.values(CONST.UPGRADE_FEATURE_INTRO_MAPPING)
                .filter((value) => value.id !== CONST.UPGRADE_FEATURE_INTRO_MAPPING.policyPreventMemberChangingTitle.id)
                .find((f) => f.alias === featureNameAlias),
        [featureNameAlias],
    );
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const [isUpgraded, setIsUpgraded] = useState(false);
    const policyDataRef = useRef<CreateWorkspaceParams | null>(null);

    const onConfirmUpgrade = useCallback(() => {
        setMoneyRequestParticipants(transactionID, [
            {
                selected: true,
                accountID: 0,
                isPolicyExpenseChat: true,
                reportID: policyDataRef.current?.expenseChatReportID,
                policyID: policyDataRef.current?.policyID,
                searchText: policyDataRef.current?.policyName,
            },
        ]);
        Navigation.goBack();

        switch (feature?.id) {
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.distanceRates.id:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE_RATE.getRoute(action, CONST.IOU.TYPE.SUBMIT, transactionID, policyDataRef.current?.expenseChatReportID));
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.categories.id:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, CONST.IOU.TYPE.SUBMIT, transactionID, policyDataRef.current?.expenseChatReportID));
                break;
            default:
        }
    }, [action, transactionID, feature]);

    const onUpgrade = useCallback(() => {
        const policyData = Policy.createWorkspace({
            policyOwnerEmail: '',
            makeMeAdmin: false,
            policyName: '',
            policyID: undefined,
            engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
        });
        setIsUpgraded(true);
        policyDataRef.current = policyData;
    }, []);

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator
            testID="workspaceUpgradePage"
            offlineIndicatorStyle={styles.mtAuto}
        >
            <HeaderWithBackButton
                title={translate('common.upgrade')}
                onBackButtonPress={() => {
                    Navigation.goBack();
                }}
            />
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                {!!isUpgraded && (
                    <UpgradeConfirmation
                        onConfirmUpgrade={onConfirmUpgrade}
                        policyName=""
                        isCategorizing={featureNameAlias === DEFAULT_FEATURE_NAME}
                    />
                )}
                {!isUpgraded && (
                    <UpgradeIntro
                        feature={feature}
                        onUpgrade={onUpgrade}
                        buttonDisabled={isOffline}
                        loading={false}
                        isCategorizing={featureNameAlias === DEFAULT_FEATURE_NAME}
                        isDistanceRateUpgrade={featureNameAlias === 'distance-rates'}
                    />
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

export default IOURequestStepUpgrade;
