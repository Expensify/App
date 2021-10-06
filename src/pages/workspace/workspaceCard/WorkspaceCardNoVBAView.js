import React from 'react';
import PropTypes from 'prop-types';
import {View, Text} from 'react-native';
import styles from '../../../styles/styles';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {Apple, Bank} from '../../../components/Icon/Expensicons';
import UnorderedList from '../../../components/UnorderedList';
import WorkspaceSection from '../WorkspaceSection';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceCardNoVBAView = ({translate, policyID}) => (
    <>
        <WorkspaceSection
            title={translate('workspace.card.header')}
            icon={Apple} // TODO: Replace this with the proper icon
            menuItems={[
                {
                    title: translate('workspace.common.bankAccount'),
                    onPress: () => Navigation.navigate(ROUTES.getWorkspaceBankAccountRoute(policyID)),
                    icon: Bank,
                    shouldShowRightIcon: true,
                },
            ]}
        >
            <View style={[styles.mv4]}>
                <Text>{translate('workspace.card.noVBACopy')}</Text>
            </View>

            <UnorderedList
                items={[
                    translate('workspace.card.benefit1'),
                    translate('workspace.card.benefit2'),
                    translate('workspace.card.benefit3'),
                    translate('workspace.card.benefit4'),
                ]}
            />
        </WorkspaceSection>
    </>
);

WorkspaceCardNoVBAView.propTypes = propTypes;
WorkspaceCardNoVBAView.displayName = 'WorkspaceCardNoVBAView';

export default withLocalize(WorkspaceCardNoVBAView);
