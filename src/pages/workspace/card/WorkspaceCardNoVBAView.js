import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import UnorderedList from '../../../components/UnorderedList';
import Section from '../../../components/Section';
import Button from '../../../components/Button';
import * as ReimbursementAccount from '../../../libs/actions/ReimbursementAccount';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceCardNoVBAView = props => (
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
        <Button
            text={props.translate('workspace.common.bankAccount')}
            onPress={() => ReimbursementAccount.navigateToBankAccountRoute(props.policyID)}
            icon={Expensicons.Bank}
            style={[styles.mt6]}
            iconStyles={[styles.mr5]}
            shouldShowRightIcon
            large
            success
        />
    </Section>
);

WorkspaceCardNoVBAView.propTypes = propTypes;
WorkspaceCardNoVBAView.displayName = 'WorkspaceCardNoVBAView';

export default withLocalize(WorkspaceCardNoVBAView);
