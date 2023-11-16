import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import ConnectBankAccountButton from '@components/ConnectBankAccountButton';
import Section from '@components/Section';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeIllustrations from '@styles/illustrations/useThemeIllustrations';
import useThemeStyles from '@styles/useThemeStyles';
import WorkspaceBillsFirstSection from './WorkspaceBillsFirstSection';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

function WorkspaceBillsNoVBAView(props) {
    const styles = useThemeStyles();
    const illustrations = useThemeIllustrations();
    return (
        <>
            <WorkspaceBillsFirstSection policyID={props.policyID} />

            <Section
                title={props.translate('workspace.bills.unlockOnlineBillPayment')}
                icon={illustrations.LockOpen}
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
