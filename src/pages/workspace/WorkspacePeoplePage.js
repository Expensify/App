import React from 'react';
import {
    View, ScrollView, Image, Text as RNText, Linking,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import Text from '../../components/Text';
import Button from '../../components/Button';
import variables from '../../styles/variables';
import themeDefault from '../../styles/themes/default';
import ROUTES from '../../ROUTES';
import CONFIG from '../../CONFIG';
import CONST from '../../CONST';
import TextLink from '../../components/TextLink';
import personalDetailsPropType from '../personalDetailsPropType';

const propTypes = {
    ...withLocalizePropTypes,

    /** The personal details of the person who is logged in */
    personalDetails: personalDetailsPropType.isRequired,

    /** The policy passed via the route */
    policy: PropTypes.shape({
        /** The policy name */
        name: PropTypes.string,
    }),

    /** URL Route params */
    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** policyID passed via route: /workspace/:policyID/people */
            policyID: PropTypes.string,
        }),
    }).isRequired,
};

const defaultProps = {
    policy: {
        name: '',
    },
};

class WorkspacePeoplePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedEmployees: [],
        };

        this.inviteUser = this.inviteUser.bind(this);
        this.removeUsers = this.removeUsers.bind(this);
    }

    /**
    * Open the modal to invite a user
    */
    inviteUser() {
        Navigation.navigate(ROUTES.getWorkspaceInviteRoute(this.props.route.params.policyID));
    }

    /**
    * Remove selected users from the workspace
    */
    removeUsers() {
        // navigate ro ROUTES.WORKSPACE_INVITE
        Navigation.navigate(ROUTES.getWorkspaceInviteRoute(this.props.route.params.policyID));
    }

    render() {
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('common.people')}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <ScrollView style={[styles.settingsPageBackground]} bounces={false}>
                    <View style={styles.pageWrapper}>
                        <Text style={[styles.mb6, styles.textP, styles.textFull]}>
                            {this.props.translate('workspace.people.tagline')}
                        </Text>
                        <View style={styles.buttonRow}>
                            <Button
                                success
                                style={[]}
                                text={this.props.translate('common.invite')}
                                onPress={this.inviteUser}
                            />
                            <Button
                                style={[styles.ml2]}
                                isDisabled={this.state.selectedEmployees.length === 0}
                                text={this.props.translate('common.remove')}
                                onPress={this.removeUsers}
                            />
                        </View>
                    </View>
                </ScrollView>
            </ScreenWrapper>
        );
    };
};

WorkspacePeoplePage.propTypes = propTypes;
WorkspacePeoplePage.defaultProps = defaultProps;
WorkspacePeoplePage.displayName = 'WorkspacePeoplePage';

export default compose(
    withLocalize,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        policy: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(WorkspacePeoplePage);
