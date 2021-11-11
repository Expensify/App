import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {
    ArrowRight,
    Bank,
} from '../../../components/Icon/Expensicons';
import {JewelBoxYellow} from '../../../components/Icon/Illustrations';
import WorkspaceSection from '../WorkspaceSection';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceTravelNoVBAView = props => (
    <>
        <WorkspaceSection
            title={props.translate('workspace.travel.unlockConciergeBookingTravel')}
            icon={JewelBoxYellow}
            menuItems={[
                {
                    title: props.translate('workspace.common.bankAccount'),
                    onPress: () => Navigation.navigate(ROUTES.getWorkspaceBankAccountRoute(props.policyID)),
                    icon: Bank,
                    shouldShowRightIcon: true,
                    iconRight: ArrowRight,
                },
            ]}
        >
            <View style={[styles.mv4]}>
                <Text>{props.translate('workspace.travel.noVBACopy')}</Text>
            </View>
        </WorkspaceSection>
    </>
);

WorkspaceTravelNoVBAView.propTypes = propTypes;
WorkspaceTravelNoVBAView.displayName = 'WorkspaceTravelNoVBAView';

export default withLocalize(WorkspaceTravelNoVBAView);
