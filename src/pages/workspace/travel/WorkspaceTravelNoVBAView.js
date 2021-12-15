import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ExpensifyText from '../../../components/ExpensifyText';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
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
            icon={Illustrations.JewelBoxYellow}
            menuItems={[
                {
                    title: props.translate('workspace.common.bankAccount'),
                    onPress: () => Navigation.navigate(ROUTES.getWorkspaceBankAccountRoute(props.policyID)),
                    icon: Expensicons.Bank,
                    shouldShowRightIcon: true,
                    iconRight: Expensicons.ArrowRight,
                },
            ]}
        >
            <View style={[styles.mv4]}>
                <ExpensifyText>{props.translate('workspace.travel.noVBACopy')}</ExpensifyText>
            </View>
        </WorkspaceSection>
    </>
);

WorkspaceTravelNoVBAView.propTypes = propTypes;
WorkspaceTravelNoVBAView.displayName = 'WorkspaceTravelNoVBAView';

export default withLocalize(WorkspaceTravelNoVBAView);
