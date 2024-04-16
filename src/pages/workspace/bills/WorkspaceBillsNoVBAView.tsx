import React from 'react';
import {View} from 'react-native';
import ConnectBankAccountButton from '@components/ConnectBankAccountButton';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import WorkspaceBillsFirstSection from './WorkspaceBillsFirstSection';

type WorkspaceBillsNoVBAViewProps = {
    /** The policy ID currently being configured */
    policyID: string;
};

function WorkspaceBillsNoVBAView({policyID}: WorkspaceBillsNoVBAViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <>
            <WorkspaceBillsFirstSection policyID={policyID} />

            <Section
                title={translate('workspace.bills.unlockOnlineBillPayment')}
                icon={Illustrations.LockOpen}
                isCentralPane
            >
                <View style={styles.mv3}>
                    <Text>{translate('workspace.bills.unlockNoVBACopy')}</Text>
                </View>
                <ConnectBankAccountButton
                    policyID={policyID}
                    style={styles.mt4}
                />
            </Section>
        </>
    );
}

WorkspaceBillsNoVBAView.displayName = 'WorkspaceBillsNoVBAView';

export default WorkspaceBillsNoVBAView;
