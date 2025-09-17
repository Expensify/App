import React, {useCallback, useMemo, useRef, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import WorkspaceConfirmationForm from '@components/WorkspaceConfirmationForm';
import type {WorkspaceConfirmationSubmitFunctionParams} from '@components/WorkspaceConfirmationForm';
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
        params: {transactionID, action, reportID, isCategorizing, isReporting, shouldSubmitExpense, featureName = DEFAULT_FEATURE_NAME},
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
    const [showConfirmationForm, setShowConfirmationForm] = useState(false);
    const [createdPolicyName, setCreatedPolicyName] = useState('');
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

    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});

    const onWorkspaceConfirmationSubmit = (params: WorkspaceConfirmationSubmitFunctionParams) => {
        const policyData = Policy.createWorkspace({
            policyOwnerEmail: '',
            makeMeAdmin: false,
            policyName: params.name,
            policyID: params.policyID,
            currency: params.currency,
            file: params.avatarFile as File,
            engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
        });
        policyDataRef.current = policyData;
        setCreatedPolicyName(params.name);
        setShowConfirmationForm(false);
        setIsUpgraded(true);
    };

    // TODO: remove this after all the changes are applied
    // eslint-disable-next-line rulesdir/prefer-early-return
    const onConfirmUpgrade = () => {
        if (isCategorizing) {
            if (shouldSubmitExpense) {
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
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, CONST.IOU.TYPE.SUBMIT, transactionID, policyDataRef.current?.expenseChatReportID));
            } else {
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, CONST.IOU.TYPE.SUBMIT, transactionID, reportID, ROUTES.REPORT_WITH_ID.getRoute(reportID)));
            }
        }
    };

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator
            testID="workspaceUpgradePage"
            offlineIndicatorStyle={styles.mtAuto}
        >
            {(!!isUpgraded || !showConfirmationForm) && (
                <HeaderWithBackButton
                    title={translate('common.upgrade')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
            )}
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                {!!isUpgraded && (
                    <UpgradeConfirmation
                        afterUpgradeAcknowledged={afterUpgradeAcknowledged}
                        onConfirmUpgrade={onConfirmUpgrade}
                        policyName={createdPolicyName}
                        isCategorizing={isCategorizing}
                        isReporting={isReporting}
                        isDistanceRateUpgrade={isDistanceRateUpgrade}
                    />
                )}
                {!isUpgraded && !showConfirmationForm && (
                    <UpgradeIntro
                        feature={feature}
                        onUpgrade={onUpgrade}
                        buttonDisabled={isOffline}
                        loading={false}
                        isCategorizing={isCategorizing}
                        isDistanceRateUpgrade={isDistanceRateUpgrade}
                    />
                )}
                {!isUpgraded && showConfirmationForm && (
                    <WorkspaceConfirmationForm
                        policyOwnerEmail={session?.email ?? ''}
                        onSubmit={onWorkspaceConfirmationSubmit}
                        onBackButtonPress={() => setShowConfirmationForm(false)}
                        addBottomSafeAreaPadding={false}
                    />
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

export default IOURequestStepUpgrade;
