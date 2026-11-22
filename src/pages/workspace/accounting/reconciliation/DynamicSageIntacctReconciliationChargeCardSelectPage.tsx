/**
 * Sage Intacct reconciliation charge card selector for Expensify Card continuous reconciliation.
 */
import BlockingView from '@components/BlockingViews/BlockingView';
import FormHelpMessage from '@components/FormHelpMessage';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReconciliationFundID from '@hooks/useReconciliationFundID';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {formatSageIntacctLiabilityAccount, getResolvedSageIntacctReconciliationCard, getSageIntacctReconciliationCreditCards} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import {setCardReconciliationLiabilityAccountDraft, toggleContinuousReconciliation} from '@userActions/Card';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import {isExpensifyCardContinuousReconciliationEnabledSelector} from '@selectors/Card';
import React, {useState} from 'react';
import {View} from 'react-native';

function DynamicSageIntacctReconciliationChargeCardSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const policyID = policy?.id ?? String(CONST.DEFAULT_NUMBER_ID);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_ACCOUNTING_RECONCILIATION_CHARGE_CARD_SELECT.path);

    const {fundID: effectiveDomainID} = useReconciliationFundID(policy?.id);
    const [continuousReconciliation] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION}${effectiveDomainID}`, {
        selector: isExpensifyCardContinuousReconciliationEnabledSelector,
    });
    const [currentConnectionName] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_CONTINUOUS_RECONCILIATION_CONNECTION}${effectiveDomainID}`);
    const [storedLiabilityAccountID] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_RECONCILIATION_LIABILITY_ACCOUNT_ID}${effectiveDomainID}`);
    const [pendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION_PENDING_ACTION}${effectiveDomainID}`);

    const creditCards = policy?.connections?.intacct?.data?.creditCards ?? [];
    const existingCard = getResolvedSageIntacctReconciliationCard(policy, storedLiabilityAccountID, !!continuousReconciliation);
    const [selectedCardID, setSelectedCardID] = useState<string | undefined>(existingCard?.id);

    const data = getSageIntacctReconciliationCreditCards(policy, selectedCardID, translate);
    const selectedCard = creditCards.find((card) => card.id === selectedCardID);
    const selectedLiabilityAccount = formatSageIntacctLiabilityAccount(selectedCard?.value, selectedCard?.liabilityAccountTitle);

    const helperText = selectedLiabilityAccount
        ? translate('workspace.sageIntacct.reconciliation.chargeCardPickerHelper', selectedLiabilityAccount)
        : translate('workspace.sageIntacct.reconciliation.chargeCardPickerHelperFallback');

    const changeWarning = existingCard && selectedCardID && selectedCardID !== existingCard.id ? translate('workspace.sageIntacct.reconciliation.changeWarning', existingCard.name) : '';

    const selectCardRow = (row: SelectorType<string>) => {
        setSelectedCardID(row.value);
    };

    const saveCard = () => {
        if (!selectedCardID || !policy?.id) {
            return;
        }
        if (continuousReconciliation) {
            toggleContinuousReconciliation(effectiveDomainID, policy.id, true, CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, currentConnectionName, selectedCardID, storedLiabilityAccountID);
        } else {
            // Keep the chosen card in Onyx until the admin turns CR on, because ToggleCardContinuousReconciliation only persists card NVPs when enabling.
            setCardReconciliationLiabilityAccountDraft(effectiveDomainID, selectedCardID);
        }
        Navigation.goBack(backPath);
    };

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.sageIntacct.noAccountsFound')}
            subtitle={translate('workspace.sageIntacct.noAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const listFooterContent = (
        <View style={[styles.ph5, styles.pt3, styles.pb2]}>
            <Text style={styles.textLabelSupporting}>{helperText}</Text>
            {!!changeWarning && (
                <FormHelpMessage
                    isError={false}
                    shouldShowRedDotIndicator={false}
                    message={changeWarning}
                    style={styles.mt3}
                />
            )}
        </View>
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="SageIntacctReconciliationChargeCardSelectPage"
            title="workspace.sageIntacct.reconciliation.chargeCard"
            data={data}
            onSelectRow={selectCardRow}
            initiallyFocusedOptionKey={selectedCardID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            listEmptyContent={listEmptyContent}
            listFooterContent={data.length > 0 ? listFooterContent : null}
            pendingAction={pendingAction}
            confirmButtonOptions={{
                enabled: data.length > 0,
                text: translate('common.save'),
                isDisabled: !selectedCardID,
                onConfirm: saveCard,
            }}
        />
    );
}

export default withPolicyConnections(DynamicSageIntacctReconciliationChargeCardSelectPage);
