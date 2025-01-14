import React, {useRef, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import type CreateWorkspaceParams from '@libs/API/parameters/CreateWorkspaceParams';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import UpgradeConfirmation from '@pages/workspace/upgrade/UpgradeConfirmation';
import UpgradeIntro from '@pages/workspace/upgrade/UpgradeIntro';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import * as Policy from '@src/libs/actions/Policy/Policy';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type IOURequestStepUpgradeProps = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.STEP_UPGRADE>;

function IOURequestStepUpgrade({
    route: {
        params: {transactionID, action},
    },
}: IOURequestStepUpgradeProps) {
    const styles = useThemeStyles();
    const feature = CONST.UPGRADE_FEATURE_INTRO_MAPPING.categories;
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const [isUpgraded, setIsUpgraded] = useState(false);
    const policyDataRef = useRef<CreateWorkspaceParams | null>(null);

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
            {!!isUpgraded && (
                <UpgradeConfirmation
                    onConfirmUpgrade={() => {
                        IOU.setMoneyRequestParticipants(transactionID, [
                            {
                                selected: true,
                                accountID: 0,
                                isPolicyExpenseChat: true,
                                reportID: policyDataRef.current?.expenseChatReportID ?? '-1',
                                policyID: policyDataRef.current?.policyID,
                                searchText: policyDataRef.current?.policyName,
                            },
                        ]);
                        Navigation.goBack();
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, CONST.IOU.TYPE.SUBMIT, transactionID, policyDataRef.current?.expenseChatReportID ?? '-1'));
                    }}
                    policyName=""
                    isCategorizing
                />
            )}
            {!isUpgraded && (
                <UpgradeIntro
                    feature={feature}
                    onUpgrade={() => {
                        const policyData = Policy.createWorkspace('', false, '', undefined, CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE);
                        setIsUpgraded(true);
                        policyDataRef.current = policyData;
                    }}
                    buttonDisabled={isOffline}
                    loading={false}
                    isCategorizing
                />
            )}
        </ScreenWrapper>
    );
}

export default IOURequestStepUpgrade;
