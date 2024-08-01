import React from 'react';
import {View} from 'react-native';
import ConnectBankAccountButton from '@components/ConnectBankAccountButton';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import WorkspaceInvoicesFirstSection from './WorkspaceInvoicesFirstSection';

type WorkspaceInvoicesNoVBAViewProps = {
    /** The policy ID currently being configured */
    policyID: string;
};

function WorkspaceInvoicesNoVBAView({policyID}: WorkspaceInvoicesNoVBAViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <>
            <WorkspaceInvoicesFirstSection policyID={policyID} />

            <Section
                title={translate('workspace.invoices.unlockOnlineInvoiceCollection')}
                icon={Illustrations.MoneyIntoWallet}
                isCentralPane
            >
                <View style={[styles.mv3]}>
                    <Text>{translate('workspace.invoices.unlockNoVBACopy')}</Text>
                </View>
                <ConnectBankAccountButton
                    policyID={policyID}
                    style={[styles.mt4]}
                />
            </Section>
        </>
    );
}

WorkspaceInvoicesNoVBAView.displayName = 'WorkspaceInvoicesNoVBAView';

export default WorkspaceInvoicesNoVBAView;
