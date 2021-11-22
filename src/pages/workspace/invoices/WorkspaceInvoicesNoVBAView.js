import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {
    ArrowRight,
    Bank,
} from '../../../components/Icon/Expensicons';
import {JewelBoxGreen} from '../../../components/Icon/Illustrations';
import WorkspaceSection from '../WorkspaceSection';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import WorkspaceInvoicesFirstSection from './WorkspaceInvoicesFirstSection';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceInvoicesNoVBAView = props => (
    <>
        <WorkspaceInvoicesFirstSection policyID={props.policyID} />

        <WorkspaceSection
            title={props.translate('workspace.invoices.unlockOnlineInvoiceCollection')}
            icon={JewelBoxGreen}
            menuItems={[
                {
                    title: props.translate('workspace.common.bankAccount'),
                    onPress: () => Navigation.navigate(ROUTES.getWorkspaceBankAccountRoute(props.policyID)),
                    icon: Bank,
                    shouldShowRightIcon: true,
                    iconRight: ArrowRight,
                },
            ]}
        >
            <View style={[styles.mv4]}>
                <Text>{props.translate('workspace.invoices.unlockNoVBACopy')}</Text>
            </View>
        </WorkspaceSection>
    </>
);

WorkspaceInvoicesNoVBAView.propTypes = propTypes;
WorkspaceInvoicesNoVBAView.displayName = 'WorkspaceInvoicesNoVBAView';

export default withLocalize(WorkspaceInvoicesNoVBAView);
