import React, {useCallback, useMemo, useRef, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setTransactionReport} from '@libs/actions/Transaction';
import type CreateWorkspaceParams from '@libs/API/parameters/CreateWorkspaceParams';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {getParticipantsOption} from '@libs/OptionsListUtils';
import UpgradeConfirmation from '@pages/workspace/upgrade/UpgradeConfirmation';
import UpgradeIntro from '@pages/workspace/upgrade/UpgradeIntro';
import {setCustomUnitRateID, setMoneyRequestParticipants} from '@userActions/IOU';
import CONST from '@src/CONST';
import * as Policy from '@src/libs/actions/Policy/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

const DEFAULT_FEATURE_NAME = 'categories';

type IOURequestStepUpgradeProps = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.STEP_UPGRADE>;

function IOURequestStepUpgrade({
    route: {
        params: {transactionID, action, featureName = DEFAULT_FEATURE_NAME},
    },
}: IOURequestStepUpgradeProps) {
    const styles = useThemeStyles();
    const feature = useMemo(
        () =>
            Object.values(CONST.UPGRADE_FEATURE_INTRO_MAPPING)
                .filter((value) => value.id !== CONST.UPGRADE_FEATURE_INTRO_MAPPING.policyPreventMemberChangingTitle.id)
                .find((f) => f.alias === featureName),
        [featureName],
    );
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: true});

    const [isUpgraded, setIsUpgraded] = useState(false);
    const policyDataRef = useRef<CreateWorkspaceParams | null>(null);
    const isDistanceRateUpgrade = featureName === CONST.UPGRADE_FEATURE_INTRO_MAPPING.distanceRates.alias;
    const isCategorizing = featureName === CONST.UPGRADE_FEATURE_INTRO_MAPPING.categories.alias;

    const afterUpgradeAcknowledged = useCallback(() => {
        const reportID = policyDataRef.current?.expenseChatReportID;
        const policyID = policyDataRef.current?.policyID;
        setMoneyRequestParticipants(transactionID, [
            {
                selected: true,
                accountID: 0,
                isPolicyExpenseChat: true,
                reportID,
                policyID,
                searchText: policyDataRef.current?.policyName,
            },
        ]);
        Navigation.goBack();

        switch (feature?.id) {
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.distanceRates.id: {
                if (!policyID || !reportID) {
                    return;
                }
                setTransactionReport(transactionID, {reportID}, true);
                // Let the confirmation step decide the distance rate because policy data is not fully available at this step
                setCustomUnitRateID(transactionID, '-1');
                Navigation.setParams({reportID});
                Navigation.navigate(ROUTES.WORKSPACE_CREATE_DISTANCE_RATE.getRoute(policyID, transactionID, reportID));
                break;
            }
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.categories.id:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, CONST.IOU.TYPE.SUBMIT, transactionID, reportID));
                break;
            default:
        }
    }, [action, transactionID, feature]);

    const adminParticipant = useMemo(() => {
        const participant = transaction?.participants?.[0];
        if (!isDistanceRateUpgrade || !participant?.accountID) {
            return;
        }

        return getParticipantsOption(participant, personalDetails);
    }, [isDistanceRateUpgrade, transaction?.participants, personalDetails]);

    const onUpgrade = useCallback(() => {
        const policyData = Policy.createWorkspace({
            policyOwnerEmail: undefined,
            policyName: undefined,
            policyID: undefined,
            engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
            currency: currentUserPersonalDetails?.localCurrencyCode ?? '',
            areDistanceRatesEnabled: isDistanceRateUpgrade,
            adminParticipant,
        });
        setIsUpgraded(true);
        policyDataRef.current = policyData;
    }, [isDistanceRateUpgrade, currentUserPersonalDetails?.localCurrencyCode, adminParticipant]);

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
                        afterUpgradeAcknowledged={afterUpgradeAcknowledged}
                        policyName=""
                        isCategorizing={isCategorizing}
                        isDistanceRateUpgrade={isDistanceRateUpgrade}
                    />
                )}
                {!isUpgraded && (
                    <UpgradeIntro
                        feature={feature}
                        onUpgrade={onUpgrade}
                        buttonDisabled={isOffline}
                        loading={false}
                        isCategorizing={isCategorizing}
                        isDistanceRateUpgrade={isDistanceRateUpgrade}
                    />
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

export default IOURequestStepUpgrade;
