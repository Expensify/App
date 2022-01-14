import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import UnorderedList from '../../../components/UnorderedList';
import Section from '../../../components/Section';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceCardNoVBAView = props => (
    <Section
        title={props.translate('workspace.card.header')}
        icon={Illustrations.JewelBoxBlue}
        menuItems={[
            {
                title: props.translate('workspace.common.bankAccount'),
                onPress: () => Navigation.navigate(ROUTES.getWorkspaceBankAccountRoute(props.policyID)),
                icon: Expensicons.Bank,
                shouldShowRightIcon: true,
            },
        ]}
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
    </Section>
);

WorkspaceCardNoVBAView.propTypes = propTypes;
WorkspaceCardNoVBAView.displayName = 'WorkspaceCardNoVBAView';

export default withLocalize(WorkspaceCardNoVBAView);
