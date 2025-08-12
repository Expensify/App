import React from 'react';
import type {GestureResponderEvent} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import * as Expensicons from '@components/Icon/Expensicons';
import type {FormattedSelectedPaymentMethodIcon} from '@hooks/usePaymentMethodState/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import PaymentMethodList from '@pages/settings/Wallet/PaymentMethodList';
import {setWorkspaceReimbursement} from '@userActions/Policy/Policy';
import {navigateToBankAccountRoute} from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

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

    const handleItemPress = (
        nativeEvent?: GestureResponderEvent | KeyboardEvent,
        accountType?: string,
        account?: OnyxTypes.AccountData,
        icon?: FormattedSelectedPaymentMethodIcon,
        isDefault?: boolean,
        methodID?: string | number,
    ) => {
        const newReimburserEmail = policy?.achAccount?.reimburser ?? policy?.owner ?? '';
        setWorkspaceReimbursement({
            policyID: route.params.policyID,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            bankAccountID: methodID as number,
            reimburserEmail: newReimburserEmail,
        });
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
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

WorkspaceWorkflowsConnectExistingBankAccountPage.displayName = 'WorkspaceWorkflowsConnectExistingBankAccountPage';

export default WorkspaceWorkflowsConnectExistingBankAccountPage;
