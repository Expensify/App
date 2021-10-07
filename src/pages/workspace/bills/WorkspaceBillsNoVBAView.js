import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {
    ArrowRight,
    Bank,
} from '../../../components/Icon/Expensicons';
import {JewelBoxPink} from '../../../components/Icon/Illustrations';
import WorkspaceSection from '../WorkspaceSection';
import compose from '../../../libs/compose';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import WorkspaceBillsFirstSection from './WorkspaceBillsFirstSection';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceBillsNoVBAView = ({translate, policyID}) => (
    <>
        <WorkspaceBillsFirstSection policyID={policyID} />

        <WorkspaceSection
            title={translate('workspace.bills.unlockOnlineBillPayment')}
            icon={JewelBoxPink}
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
                <Text>{translate('workspace.bills.unlockNoVBACopy')}</Text>
            </View>
        </WorkspaceSection>
    </>
);

WorkspaceBillsNoVBAView.propTypes = propTypes;
WorkspaceBillsNoVBAView.displayName = 'WorkspaceBillsNoVBAView';

export default compose(
    withLocalize,
)(WorkspaceBillsNoVBAView);
