import React from 'react';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import ONYXKEYS from '@src/ONYXKEYS';

type WorkspaceInvoiceBalanceSectionProps = {
    /** The policy ID currently being configured */
    policyID: string;
};

function WorkspaceInvoiceBalanceSection({policyID}: WorkspaceInvoiceBalanceSectionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    return (
        <Section
            title={translate('workspace.invoices.invoiceBalance')}
            subtitle={translate('workspace.invoices.invoiceBalanceSubtitle')}
            isCentralPane
            titleStyles={styles.accountSettingsSectionTitle}
            childrenStyles={styles.pt5}
            subtitleMuted
        >
            <MenuItemWithTopDescription
                description={translate('walletPage.balance')}
                title={CurrencyUtils.convertToDisplayString(policy?.invoice?.bankAccount?.stripeConnectAccountBalance ?? 0, policy?.outputCurrency)}
                titleStyle={styles.textHeadlineH2}
                interactive={false}
                wrapperStyle={styles.sectionMenuItemTopDescription}
            />
        </Section>
    );
}

export default WorkspaceInvoiceBalanceSection;
