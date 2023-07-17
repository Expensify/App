import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Illustrations from '../../../components/Icon/Illustrations';
import UnorderedList from '../../../components/UnorderedList';
import Section from '../../../components/Section';
import ConnectBankAccountButton from '../../../components/ConnectBankAccountButton';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

function WorkspaceCardNoVBAView(props) {
    return (
        <Section
            title={props.translate('workspace.card.header')}
            icon={Illustrations.CreditCardsNew}
        >
            <View style={[styles.mv4]}>
                <Text>{props.translate('workspace.card.noVBACopy')}</Text>
            </View>

            <UnorderedList
                items={[
                    props.translate('workspace.card.benefit1'),
                    props.translate('workspace.card.benefit2'),
                    props.translate('workspace.card.benefit3'),
                    props.translate('workspace.card.benefit4'),
                ]}
            />
            <ConnectBankAccountButton
                policyID={props.policyID}
                style={[styles.mt6]}
            />
        </Section>
    );
}

WorkspaceCardNoVBAView.propTypes = propTypes;
WorkspaceCardNoVBAView.displayName = 'WorkspaceCardNoVBAView';

export default withLocalize(WorkspaceCardNoVBAView);
