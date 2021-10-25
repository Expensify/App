import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {
    CircleHourglass,
    NewWindow,
} from '../../../components/Icon/Expensicons';
import {MoneyMousePink} from '../../../components/Icon/Illustrations';
import WorkspaceSection from '../WorkspaceSection';
import WorkspaceInvoicesFirstSection from './WorkspaceInvoicesFirstSection';
import {openOldDotLink} from '../../../libs/actions/Link';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceInvoicesVBAView = ({translate, policyID}) => (
    <>
        <WorkspaceInvoicesFirstSection policyID={policyID} />

        <WorkspaceSection
            title={translate('workspace.invoices.moneyBackInAFlash')}
            icon={MoneyMousePink}
            menuItems={[
                {
                    title: translate('workspace.invoices.viewUnpaidInvoices'),
                    onPress: () => openOldDotLink(`reports?policyID=${policyID}&from=all&type=invoice&showStates=Processing&isAdvancedFilterMode=true`),
                    icon: CircleHourglass,
                    shouldShowRightIcon: true,
                    iconRight: NewWindow,
                },
            ]}
        >
            <View style={[styles.mv4]}>
                <Text>{translate('workspace.invoices.unlockVBACopy')}</Text>
            </View>
        </WorkspaceSection>
    </>
);

WorkspaceInvoicesVBAView.propTypes = propTypes;
WorkspaceInvoicesVBAView.displayName = 'WorkspaceInvoicesVBAView';

export default withLocalize(WorkspaceInvoicesVBAView);
