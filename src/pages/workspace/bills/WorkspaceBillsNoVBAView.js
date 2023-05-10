import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import Section from '../../../components/Section';
import WorkspaceBillsFirstSection from './WorkspaceBillsFirstSection';
import Button from '../../../components/Button';
import * as ReimbursementAccount from '../../../libs/actions/ReimbursementAccount';

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
            icon={Illustrations.LockOpen}
            containerStyles={[styles.cardSection]}
        >
            <View style={[styles.mv3]}>
                <Text>{props.translate('workspace.bills.unlockNoVBACopy')}</Text>
            </View>
            <Button
                text={props.translate('workspace.common.bankAccount')}
                onPress={() => ReimbursementAccount.navigateToBankAccountRoute(props.policyID)}
                icon={Expensicons.Bank}
                style={[styles.mt4]}
                iconStyles={[styles.buttonCTAIcon]}
                shouldShowRightIcon
                large
                success
            />
        </Section>
    </>
);

WorkspaceBillsNoVBAView.propTypes = propTypes;
WorkspaceBillsNoVBAView.displayName = 'WorkspaceBillsNoVBAView';

export default withLocalize(WorkspaceBillsNoVBAView);
