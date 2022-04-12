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
import Button from '../../../components/Button';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceTravelNoVBAView = props => (
    <>
        <Section
            title={props.translate('workspace.travel.unlockConciergeBookingTravel')}
            icon={Illustrations.JewelBoxYellow}
        >
            <View style={[styles.mv4]}>
                <Text>{props.translate('workspace.travel.noVBACopy')}</Text>
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

WorkspaceTravelNoVBAView.propTypes = propTypes;
WorkspaceTravelNoVBAView.displayName = 'WorkspaceTravelNoVBAView';

export default withLocalize(WorkspaceTravelNoVBAView);
