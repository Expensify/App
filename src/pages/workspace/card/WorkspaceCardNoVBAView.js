import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import ExpensifyText from '../../../components/ExpensifyText';
import styles from '../../../styles/styles';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import UnorderedList from '../../../components/UnorderedList';
import WorkspaceSection from '../WorkspaceSection';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceCardNoVBAView = props => (
    <WorkspaceSection
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
            <ExpensifyText>{props.translate('workspace.card.noVBACopy')}</ExpensifyText>
        </View>

        <UnorderedList
            items={[
                props.translate('workspace.card.benefit1'),
                props.translate('workspace.card.benefit2'),
                props.translate('workspace.card.benefit3'),
                props.translate('workspace.card.benefit4'),
            ]}
        />
    </WorkspaceSection>
);

WorkspaceCardNoVBAView.propTypes = propTypes;
WorkspaceCardNoVBAView.displayName = 'WorkspaceCardNoVBAView';

export default withLocalize(WorkspaceCardNoVBAView);
