import React from 'react';
import {View} from 'react-native';
import ConnectBankAccountButton from '@components/ConnectBankAccountButton';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import UnorderedList from '@components/UnorderedList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

type WorkspaceCardNoVBAViewProps = {
    /** The policy ID currently being configured */
    policyID: string;
};

function WorkspaceCardNoVBAView({policyID}: WorkspaceCardNoVBAViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const unorderedListItems = [translate('workspace.card.benefit1'), translate('workspace.card.benefit2'), translate('workspace.card.benefit3'), translate('workspace.card.benefit4')];

    return (
        <Section
            title={translate('workspace.card.header')}
            icon={Illustrations.CreditCardsNew}
            isCentralPane
        >
            <View style={[styles.mv4]}>
                <Text>{translate('workspace.card.noVBACopy')}</Text>
            </View>

            <UnorderedList items={unorderedListItems} />
            <ConnectBankAccountButton
                policyID={policyID}
                style={[styles.mt6]}
            />
        </Section>
    );
}

WorkspaceCardNoVBAView.displayName = 'WorkspaceCardNoVBAView';

export default WorkspaceCardNoVBAView;
