import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Illustrations from '../../../components/Icon/Illustrations';
import Section from '../../../components/Section';
import WorkspaceBillsFirstSection from './WorkspaceBillsFirstSection';
import ConnectBankAccountButton from '../../../components/ConnectBankAccountButton';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

function WorkspaceBillsNoVBAView(props) {
    return (
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
                <ConnectBankAccountButton
                    policyID={props.policyID}
                    style={[styles.mt4]}
                />
            </Section>
        </>
    );
}

WorkspaceBillsNoVBAView.propTypes = propTypes;
WorkspaceBillsNoVBAView.displayName = 'WorkspaceBillsNoVBAView';

export default withLocalize(WorkspaceBillsNoVBAView);
