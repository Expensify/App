import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import Section from '../../../components/Section';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import WorkspaceBillsFirstSection from './WorkspaceBillsFirstSection';
import Button from '../../../components/Button';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceBillsNoVBAView = props => (
    <>
        <WorkspaceBillsFirstSection policyID={props.policyID} />

        <Section
            title={props.translate('workspace.bills.unlockOnlineBillPayment')}
            icon={Illustrations.JewelBoxPink}
        >
            <View style={[styles.mv4]}>
                <Text>{props.translate('workspace.bills.unlockNoVBACopy')}</Text>
            </View>
            <Button
                text={props.translate('workspace.common.bankAccount')}
                onPress={() => Navigation.navigate(ROUTES.getWorkspaceBankAccountRoute(props.policyID))}
                icon={Expensicons.Bank}
                style={[styles.mt4]}
                iconStyles={[styles.mr5]}
                shouldShowRightIcon
                xLarge
                success
            />
        </Section>
    </>
);

WorkspaceBillsNoVBAView.propTypes = propTypes;
WorkspaceBillsNoVBAView.displayName = 'WorkspaceBillsNoVBAView';

export default withLocalize(WorkspaceBillsNoVBAView);
