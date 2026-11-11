import MenuItem from '@components/MenuItem';
import Section from '@components/Section';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

type WorkspaceInvoiceBalanceSectionProps = {
    /** The policy ID currently being configured */
    policyID: string;
};

function WorkspaceInvoiceBalanceSection({policyID}: WorkspaceInvoiceBalanceSectionProps) {
    const {convertToDisplayString} = useCurrencyListActions();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const invoiceBalance = convertToDisplayString(policy?.invoice?.bankAccount?.stripeConnectAccountBalance ?? 0, policy?.outputCurrency);
    const balanceLabel = translate('walletPage.balance');

    return (
        <Section
            title={translate('workspace.invoices.invoiceBalance')}
            subtitle={translate('workspace.invoices.invoiceBalanceSubtitle')}
            isCentralPane
            titleStyles={styles.accountSettingsSectionTitle}
            childrenStyles={styles.pt5}
            subtitleMuted
        >
            <MenuItem.Root style={styles.sectionMenuItemTopDescription}>
                <MenuItem.Row>
                    <MenuItem.Content>
                        <MenuItem.FieldName>{balanceLabel}</MenuItem.FieldName>
                        <MenuItem.FieldValue style={styles.textHeadlineH2}>{invoiceBalance}</MenuItem.FieldValue>
                    </MenuItem.Content>
                </MenuItem.Row>
            </MenuItem.Root>
        </Section>
    );
}

export default WorkspaceInvoiceBalanceSection;
