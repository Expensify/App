import React, {useRef, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import WorkspaceConfirmationForm from '@components/WorkspaceConfirmationForm';
import type {WorkspaceConfirmationSubmitFunctionParams} from '@components/WorkspaceConfirmationForm';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
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
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type IOURequestStepUpgradeProps = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.STEP_UPGRADE>;

function IOURequestStepUpgrade({
    route: {
        params: {transactionID, action, reportID, isCategorizing, isReporting, shouldSubmitExpense},
    },
}: IOURequestStepUpgradeProps) {
    const styles = useThemeStyles();
    const feature = CONST.UPGRADE_FEATURE_INTRO_MAPPING.categories;
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const [isUpgraded, setIsUpgraded] = useState(false);
    const [showConfirmationForm, setShowConfirmationForm] = useState(false);
    const [createdPolicyName, setCreatedPolicyName] = useState('');
    const policyDataRef = useRef<CreateWorkspaceParams | null>(null);

    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});

    const onWorkspaceConfirmationSubmit = (params: WorkspaceConfirmationSubmitFunctionParams) => {
        const policyData = Policy.createWorkspace({
            policyOwnerEmail: '',
            makeMeAdmin: false,
            policyName: params.name,
            policyID: params.policyID,
            currency: params.currency,
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
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, CONST.IOU.TYPE.SUBMIT, transactionID, reportID));
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
                        onConfirmUpgrade={onConfirmUpgrade}
                        policyName={createdPolicyName}
                        isCategorizing={isCategorizing}
                        isReporting={isReporting}
                    />
                )}
                {!isUpgraded && !showConfirmationForm && (
                    <UpgradeIntro
                        feature={feature}
                        onUpgrade={() => setShowConfirmationForm(true)}
                        buttonDisabled={isOffline}
                        loading={false}
                        isCategorizing={isCategorizing}
                        isReporting={isReporting}
                    />
                )}
                {!isUpgraded && showConfirmationForm && (
                    <WorkspaceConfirmationForm
                        policyOwnerEmail={session?.email ?? ''}
                        onSubmit={onWorkspaceConfirmationSubmit}
                        onBackButtonPress={() => setShowConfirmationForm(false)}
                    />
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

export default IOURequestStepUpgrade;
