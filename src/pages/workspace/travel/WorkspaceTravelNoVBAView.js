import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Illustrations from '../../../components/Icon/Illustrations';
import Section from '../../../components/Section';
import ConnectBankAccountButton from '../../../components/ConnectBankAccountButton';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

function WorkspaceTravelNoVBAView(props) {
    return (
        <>
            <Section
                title={props.translate('workspace.travel.unlockConciergeBookingTravel')}
                icon={Illustrations.Luggage}
            >
                <View style={[styles.mv3]}>
                    <Text>{props.translate('workspace.travel.noVBACopy')}</Text>
                </View>
                <ConnectBankAccountButton
                    policyID={props.policyID}
                    style={[styles.mt4]}
                />
            </Section>
        </>
    );
}

WorkspaceTravelNoVBAView.propTypes = propTypes;
WorkspaceTravelNoVBAView.displayName = 'WorkspaceTravelNoVBAView';

export default withLocalize(WorkspaceTravelNoVBAView);
