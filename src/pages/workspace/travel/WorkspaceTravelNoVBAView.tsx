import React from 'react';
import {View} from 'react-native';
import ConnectBankAccountButton from '@components/ConnectBankAccountButton';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

type WorkspaceTravelNoVBAViewProps = {
    /** The policy ID currently being configured */
    policyID: string;
};

function WorkspaceTravelNoVBAView({policyID}: WorkspaceTravelNoVBAViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Section
            title={translate('workspace.travel.unlockConciergeBookingTravel')}
            icon={Illustrations.Luggage}
            isCentralPane
        >
            <View style={styles.mv3}>
                <Text>{translate('workspace.travel.noVBACopy')}</Text>
            </View>
            <ConnectBankAccountButton
                policyID={policyID}
                style={styles.mt4}
            />
        </Section>
    );
}

WorkspaceTravelNoVBAView.displayName = 'WorkspaceTravelNoVBAView';

export default WorkspaceTravelNoVBAView;
