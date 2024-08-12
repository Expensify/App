import React from 'react';
import {useOnyx} from 'react-native-onyx';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import PaymentMethodList from '@pages/settings/Wallet/PaymentMethodList';
import ONYXKEYS from '@src/ONYXKEYS';

type WorkspaceInvoiceVBASectionProps = {
    /** The policy ID currently being configured */
    policyID: string;
};

function WorkspaceInvoiceVBASection({policyID}: WorkspaceInvoiceVBASectionProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    return (
        <Section
            subtitle={translate('walletPage.addBankAccountToSendAndReceive')}
            title={translate('walletPage.bankAccounts')}
            isCentralPane
            titleStyles={styles.accountSettingsSectionTitle}
        >
            <PaymentMethodList
                shouldShowAddPaymentMethodButton={false}
                shouldShowEmptyListMessage={false}
                onPress={() => console.debug('onPress')}
                // actionPaymentMethodType={shouldShowDefaultDeleteMenu ? paymentMethod.selectedPaymentMethodType : ''}
                activePaymentMethodID={policy?.invoice?.bankAccount?.transferBankAccountID ?? ''}
                // buttonRef={addPaymentMethodAnchorRef}
                // onListContentSizeChange={shouldShowAddPaymentMenu || shouldShowDefaultDeleteMenu ? setMenuPosition : () => {}}
                shouldEnableScroll={false}
                style={[styles.mt5, [shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8]]}
                listItemStyle={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}
            />
        </Section>
    );
}

WorkspaceInvoiceVBASection.displayName = 'WorkspaceInvoiceVBASection';

export default WorkspaceInvoiceVBASection;
