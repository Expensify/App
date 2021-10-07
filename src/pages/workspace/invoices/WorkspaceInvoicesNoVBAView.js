import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {
    Apple,
    ArrowRight,
    Bank,
} from '../../../components/Icon/Expensicons';
import WorkspaceSection from '../WorkspaceSection';
import compose from '../../../libs/compose';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import WorkspaceInvoicesFirstSection from './WorkspaceInvoicesFirstSection';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceBillsNoVBAView = ({translate, policyID}) => {
    return (
        <>
            <WorkspaceInvoicesFirstSection policyID={policyID} />

            <WorkspaceSection
                title={translate('workspace.invoices.unlockOnlineInvoicesCollection')}
                icon={Apple} // TODO: Replace this with the proper icon
                menuItems={[
                    {
                        title: translate('workspace.common.bankAccount'),
                        onPress: () => Navigation.navigate(ROUTES.getWorkspaceBankAccountRoute(policyID)),
                        icon: Bank,
                        shouldShowRightIcon: true,
                        iconRight: ArrowRight,
                    },
                ]}
            >
                <View style={[styles.mv4]}>
                    <Text>{translate('workspace.invoices.unlockNoVBACopy')}</Text>
                </View>
            </WorkspaceSection>
        </>
    );
};

WorkspaceBillsNoVBAView.propTypes = propTypes;
WorkspaceBillsNoVBAView.displayName = 'WorkspaceBillsNoVBAView';

export default compose(
    withLocalize,
)(WorkspaceBillsNoVBAView);
