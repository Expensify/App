import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import Section from '../../../components/Section';
import WorkspaceInvoicesFirstSection from './WorkspaceInvoicesFirstSection';
import * as Link from '../../../libs/actions/Link';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceInvoicesVBAView = props => (
    <>
        <WorkspaceInvoicesFirstSection policyID={props.policyID} />

        <Section
            title={props.translate('workspace.invoices.moneyBackInAFlash')}
            icon={Illustrations.MoneyMousePink}
            menuItems={[
                {
                    title: props.translate('workspace.invoices.viewUnpaidInvoices'),
                    onPress: () => Link.openOldDotLink(`reports?policyID=${props.policyID}&from=all&type=invoice&showStates=Processing&isAdvancedFilterMode=true`),
                    icon: Expensicons.CircleHourglass,
                    shouldShowRightIcon: true,
                    iconRight: Expensicons.NewWindow,
                },
            ]}
        >
            <View style={[styles.mv4]}>
                <Text>{props.translate('workspace.invoices.unlockVBACopy')}</Text>
            </View>
        </Section>
    </>
);

WorkspaceInvoicesVBAView.propTypes = propTypes;
WorkspaceInvoicesVBAView.displayName = 'WorkspaceInvoicesVBAView';

export default withLocalize(WorkspaceInvoicesVBAView);
