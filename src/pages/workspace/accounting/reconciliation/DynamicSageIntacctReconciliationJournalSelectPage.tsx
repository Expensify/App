/**
 * Shared Sage Intacct reconciliation journal selector used by Expensify Card and Travel Billing settings.
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
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';

import {updateSageIntacctReconciliationJournal} from '@libs/actions/connections/SageIntacct';
import {clearSageIntacctErrorField} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {
    formatSageIntacctJournalLabel,
    getResolvedSageIntacctReconciliationJournal,
    getSageIntacctReconciliationJournals,
    isSageIntacctDualBookCompany,
    settingsPendingAction,
} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import {isExpensifyCardContinuousReconciliationEnabledSelector} from '@selectors/Card';
import React, {useState} from 'react';
import {View} from 'react-native';

function DynamicSageIntacctReconciliationJournalSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const policyID = policy?.id ?? String(CONST.DEFAULT_NUMBER_ID);
    const config = policy?.connections?.intacct?.config;
    const journals = policy?.connections?.intacct?.data?.journals ?? [];
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_RECONCILIATION_JOURNAL_SELECT.path);

    const {fundID: cardFundID} = useReconciliationFundID(policy?.id);
    const workspaceAccountID = useWorkspaceAccountID(policy?.id);
    const [cardCR] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION}${cardFundID}`, {
        selector: isExpensifyCardContinuousReconciliationEnabledSelector,
    });
    const [travelCR] = useOnyx(`${ONYXKEYS.COLLECTION.TRAVEL_BILLING_USE_CONTINUOUS_RECONCILIATION}${workspaceAccountID}`);
    const isExistingCR = !!cardCR || !!travelCR;

    const existingJournal = getResolvedSageIntacctReconciliationJournal(policy, isExistingCR);
    const [selectedJournalID, setSelectedJournalID] = useState<string | undefined>(existingJournal?.id);

    const isDualBook = isSageIntacctDualBookCompany(policy);
    const data = getSageIntacctReconciliationJournals(policy, selectedJournalID, translate);
    const selectedJournal = journals.find((journal) => journal.id === selectedJournalID);
    const selectedBook = selectedJournal?.value?.trim().toUpperCase() ?? '';
    const isNoBookBlocked = isDualBook && !!selectedJournal && !selectedBook;

    let oneBookWarning = '';
    if (isDualBook && selectedBook === CONST.SAGE_INTACCT_JOURNAL_BOOK.ACCRUAL) {
        oneBookWarning = translate(
            'workspace.sageIntacct.reconciliation.oneBookWarning',
            translate('workspace.sageIntacct.reconciliation.journalBooks.accrual'),
            translate('workspace.sageIntacct.reconciliation.journalBooks.cash'),
        );
    } else if (isDualBook && selectedBook === CONST.SAGE_INTACCT_JOURNAL_BOOK.CASH) {
        oneBookWarning = translate(
            'workspace.sageIntacct.reconciliation.oneBookWarning',
            translate('workspace.sageIntacct.reconciliation.journalBooks.cash'),
            translate('workspace.sageIntacct.reconciliation.journalBooks.accrual'),
        );
    }

    const changeWarning =
        existingJournal && selectedJournalID && selectedJournalID !== existingJournal.id
            ? translate('workspace.sageIntacct.reconciliation.changeWarning', formatSageIntacctJournalLabel(existingJournal))
            : '';

    const selectJournalRow = (row: SelectorType<string>) => {
        if (row.isDisabled) {
            return;
        }
        setSelectedJournalID(row.value);
    };

    const saveJournal = () => {
        if (!selectedJournalID || isNoBookBlocked) {
            return;
        }
        if (selectedJournalID !== config?.reconciliationJournal) {
            updateSageIntacctReconciliationJournal(policyID, selectedJournalID, config?.reconciliationJournal);
        }
        Navigation.goBack(backPath);
    };

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.sageIntacct.reconciliation.noJournalsFound')}
            subtitle={translate('workspace.sageIntacct.reconciliation.noJournalsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const listFooterContent = (
        <View style={[styles.ph5, styles.pt3, styles.pb2]}>
            <Text style={styles.textLabelSupporting}>{translate('workspace.sageIntacct.reconciliation.journalPickerHelper')}</Text>
            {isNoBookBlocked && (
                <FormHelpMessage
                    isError
                    message={translate('workspace.sageIntacct.reconciliation.dualBookNoBookWarning')}
                    style={styles.mt3}
                />
            )}
            {!!oneBookWarning && (
                <FormHelpMessage
                    isError={false}
                    shouldShowRedDotIndicator={false}
                    message={oneBookWarning}
                    style={styles.mt3}
                />
            )}
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
            displayName="SageIntacctReconciliationJournalSelectPage"
            title="workspace.sageIntacct.reconciliation.journal"
            data={data}
            onSelectRow={selectJournalRow}
            initiallyFocusedOptionKey={selectedJournalID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            listEmptyContent={listEmptyContent}
            listFooterContent={data.length > 0 ? listFooterContent : null}
            pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.RECONCILIATION_JOURNAL], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.SAGE_INTACCT_CONFIG.RECONCILIATION_JOURNAL)}
            onClose={() => clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.RECONCILIATION_JOURNAL)}
            confirmButtonOptions={{
                showButton: data.length > 0,
                text: translate('common.save'),
                isDisabled: !selectedJournalID || isNoBookBlocked,
                onConfirm: saveJournal,
            }}
        />
    );
}

export default withPolicyConnections(DynamicSageIntacctReconciliationJournalSelectPage);
