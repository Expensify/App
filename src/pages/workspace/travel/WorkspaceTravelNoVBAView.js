import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import ConnectBankAccountButton from '@components/ConnectBankAccountButton';
import Section from '@components/Section';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeIllustrations from '@styles/illustrations/useThemeIllustrations';
import useThemeStyles from '@styles/useThemeStyles';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

function WorkspaceTravelNoVBAView(props) {
    const styles = useThemeStyles();
    const illustrations = useThemeIllustrations();
    return (
        <>
            <Section
                title={props.translate('workspace.travel.unlockConciergeBookingTravel')}
                icon={illustrations.Luggage}
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
