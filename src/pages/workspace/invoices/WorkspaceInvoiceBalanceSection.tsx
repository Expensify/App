import MenuItem from '@components/MenuItem';
import Section from '@components/Section';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import convertToLTR from '@libs/convertToLTR';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';

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
            <MenuItem.Root
                style={styles.sectionMenuItemTopDescription}
                accessibilityLabel={`${balanceLabel}, ${invoiceBalance}`}
            >
                <MenuItem.Row>
                    <MenuItem.Content>
                        <Text
                            style={[styles.textLabelSupporting, styles.textLineHeightNormal, styles.breakWord]}
                            numberOfLines={2}
                        >
                            {balanceLabel}
                        </Text>
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mw100]}>
                            <Text
                                style={[styles.flexShrink1, styles.pre, styles.ltr, styles.mw100, styles.textHeadlineH2]}
                                numberOfLines={1}
                            >
                                {convertToLTR(invoiceBalance)}
                            </Text>
                        </View>
                    </MenuItem.Content>
                </MenuItem.Row>
            </MenuItem.Root>
        </Section>
    );
}

export default WorkspaceInvoiceBalanceSection;
