import React from 'react';
import {View} from 'react-native';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getRouteParamForConnection} from '@libs/AccountingUtils';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ConnectionName} from '@src/types/onyx/Policy';

type WorkspaceSettlementSelectionListHeaderProps = {policyID: string};

function WorkspaceSettlementAccountSelectionListHeader({policyID}: WorkspaceSettlementSelectionListHeaderProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const defaultFundID = useDefaultFundID(policyID);

    const [isUsingContinuousReconciliation] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION}${defaultFundID}`, {canBeMissing: true});
    const [bankAccountsList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [reconciliationConnection] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_CONTINUOUS_RECONCILIATION_CONNECTION}${defaultFundID}`, {canBeMissing: true});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`, {canBeMissing: true});

    const paymentBankAccountID = cardSettings?.paymentBankAccountID;
    const paymentBankAccountNumberFromCardSettings = cardSettings?.paymentBankAccountNumber;

    const connectionName = reconciliationConnection ?? '';
    const connectionParam = getRouteParamForConnection(connectionName as ConnectionName);

    const paymentBankAccountNumber = bankAccountsList?.[paymentBankAccountID?.toString() ?? '']?.accountData?.accountNumber ?? paymentBankAccountNumberFromCardSettings ?? '';

    const hasActiveAccountingConnection = !!(policy?.connections && Object.keys(policy.connections).length > 0);

    return (
        <>
            <Text style={[styles.mh5, styles.mv4]}>{translate('workspace.expensifyCard.settlementAccountDescription')}</Text>
            {!!isUsingContinuousReconciliation && !!connectionParam && hasActiveAccountingConnection && (
                <View style={[styles.renderHTML, styles.mh5, styles.mb6]}>
                    <RenderHTML
                        html={translate('workspace.expensifyCard.settlementAccountInfo', {
                            reconciliationAccountSettingsLink: `${environmentURL}/${ROUTES.WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS.getRoute(policyID, connectionParam, Navigation.getActiveRoute())}`,
                            accountNumber: `${CONST.MASKED_PAN_PREFIX}${getLastFourDigits(paymentBankAccountNumber)}`,
                        })}
                    />
                </View>
            )}
        </>
    );
}

WorkspaceSettlementAccountSelectionListHeader.displayName = 'WorkspaceSettlementAccountSelectionListHeader';

export default WorkspaceSettlementAccountSelectionListHeader;
