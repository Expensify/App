import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import PaymentMethodList from '@pages/settings/Wallet/PaymentMethodList';
import type {PaymentMethodPressHandlerParams} from '@pages/settings/Wallet/WalletPage/types';
import {setWorkspaceReimbursement} from '@userActions/Policy/Policy';
import {navigateToBankAccountRoute} from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceWorkflowsConnectExistingBankAccountPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_CONNECT_EXISTING_BANK_ACCOUNT>;

function WorkspaceWorkflowsConnectExistingBankAccountPage({route}: WorkspaceWorkflowsConnectExistingBankAccountPageProps) {
    const policyID = route.params?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: false});
    const policyName = policy?.name ?? '';
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const handleAddBankAccountPress = () => {
        navigateToBankAccountRoute(route.params.policyID, ROUTES.WORKSPACE_WORKFLOWS.getRoute(route.params.policyID));
    };

    const handleItemPress = ({methodID}: PaymentMethodPressHandlerParams) => {
        const newReimburserEmail = policy?.achAccount?.reimburser ?? policy?.owner ?? '';
        setWorkspaceReimbursement({
            policyID: route.params.policyID,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            bankAccountID: methodID ?? CONST.DEFAULT_NUMBER_ID,
            reimburserEmail: newReimburserEmail,
        });
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID)));
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={WorkspaceWorkflowsConnectExistingBankAccountPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('bankAccount.addBankAccount')}
                subtitle={policyName}
                onBackButtonPress={Navigation.goBack}
            />
            <ScrollView style={[styles.w100, shouldUseNarrowLayout ? [styles.pt3, styles.ph5, styles.pb5] : [styles.pt5, styles.ph8, styles.pb8]]}>
                <Text>{translate('workspace.bankAccount.chooseAnExisting')}</Text>
                <PaymentMethodList
                    onPress={handleItemPress}
                    onAddBankAccountPress={handleAddBankAccountPress}
                    style={[styles.mt5, [shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8]]}
                    listItemStyle={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}
                    itemIconRight={Expensicons.ArrowRight}
                    filterType={CONST.BANK_ACCOUNT.TYPE.BUSINESS}
                    shouldHideDefaultBadge
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

WorkspaceWorkflowsConnectExistingBankAccountPage.displayName = 'WorkspaceWorkflowsConnectExistingBankAccountPage';

export default WorkspaceWorkflowsConnectExistingBankAccountPage;
