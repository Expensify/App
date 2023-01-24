import React from 'react';
import PropTypes from 'prop-types';
import {Pressable, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import FullPageNotFoundView from '../components/BlockingViews/FullPageNotFoundView';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import TextInput from '../components/TextInput';
import FormAlertWithSubmitButton from '../components/FormAlertWithSubmitButton';
import OptionsSelector from '../components/OptionsSelector';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import ROUTES from '../ROUTES';
import * as Localize from '../libs/Localize';
import {withNetwork} from '../components/OnyxProvider';
import withPolicy, {policyPropTypes, policyDefaultProps} from './Workspace/withPolicy';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import networkPropTypes from '../components/networkPropTypes';
import reportPropTypes from './reportPropTypes';
import styles from '../styles/styles';
import Navigation from '../libs/Navigation/Navigation';
import withReportOrNavigateHome from './home/report/withReportOrNavigateHome';
import CONST from '../CONST';

// const personalDetailsPropTypes = PropTypes.shape({
//     /** The login of the person (either email or phone number) */
//     login: PropTypes.string.isRequired,

//     /** The URL of the person's avatar (there should already be a default avatar if
//     the person doesn't have their own avatar uploaded yet) */
//     avatar: PropTypes.string.isRequired,

//     /** This is either the user's full name, or their login if full name is an empty string */
//     displayName: PropTypes.string.isRequired,
// });

const propTypes = {
    /** The active report */
    report: reportPropTypes.isRequired,

    /** URL Route params */
    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** policyID passed via route: /workspace/:policyID/invite */
            policyID: PropTypes.string,
        }),
    }).isRequired,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** The policy name */
        name: PropTypes.string,

        /** ID of the policy */
        id: PropTypes.string,
    }).isRequired,

    ...policyPropTypes,
    ...withLocalizePropTypes,
    network: networkPropTypes.isRequired,
};

const defaultProps = policyDefaultProps;

class RoomInvitePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            searchTerm: '',
            selectedOptions: [],
            shouldDisableButton: false,
        };
    }

    componentDidMount() {
        // this.clearErrors();

        
    }

    /**
     * Handle the invite button click
     */
    inviteUser() {
    }

    // /**
    //  * Returns the sections needed for the OptionsSelector
    //  * @returns {Array}
    //  */
    // getSections() {
    //     const sections = [];
    //     let indexOffset = 0;

    //     sections.push({
    //         title: undefined,
    //         data: this.state.selectedOptions,
    //         shouldShow: true,
    //         indexOffset,
    //     });
    //     indexOffset += this.state.selectedOptions.length;

    //     // Filtering out selected users from the search results
    //     const filterText = _.reduce(this.state.selectedOptions, (str, {login}) => `${str} ${login}`, '');
    //     const personalDetailsWithoutSelected = _.filter(this.state.personalDetails, ({login}) => !filterText.includes(login));
    //     const hasUnselectedUserToInvite = this.state.userToInvite && !filterText.includes(this.state.userToInvite.login);

    //     sections.push({
    //         title: this.props.translate('common.contacts'),
    //         data: personalDetailsWithoutSelected,
    //         shouldShow: !_.isEmpty(personalDetailsWithoutSelected),
    //         indexOffset,
    //     });
    //     indexOffset += personalDetailsWithoutSelected.length;

    //     if (hasUnselectedUserToInvite) {
    //         sections.push(({
    //             title: undefined,
    //             data: [this.state.userToInvite],
    //             shouldShow: true,
    //             indexOffset,
    //         }));
    //     }

    //     return sections;
    // }

    render() {
        // const sections = this.getSections();
        // const headerMessage = OptionsListUtils.getHeaderMessage(
        //     this.state.personalDetails.length !== 0,
        //     Boolean(this.state.userToInvite),
        //     this.state.searchTerm,
        // );
        // const policyName = lodashGet(this.props.policy, 'name');

        return (
            <ScreenWrapper>
                {({didScreenTransitionEnd}) => (
                    <>
                        <HeaderWithCloseButton
                            title={this.props.translate('workspace.invite.invitePeople')}
                            // subtitle={policyName}
                            onCloseButtonPress={() => this.clearErrors(true)}
                            shouldShowGetAssistanceButton
                            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_MEMBERS}
                            shouldShowBackButton
                            onBackButtonPress={() => Navigation.goBack()}
                        />
                        <View style={[styles.flex1]}>
                            {didScreenTransitionEnd ? (
                                <OptionsSelector
                                    autoFocus={false}
                                    canSelectMultipleOptions
                                    // sections={sections}
                                    selectedOptions={this.state.selectedOptions}
                                    value={this.state.searchTerm}
                                    onSelectRow={this.toggleOption}
                                    onChangeText={this.updateOptionsWithSearchTerm}
                                    onConfirmSelection={this.inviteUser}
                                    // headerMessage={headerMessage}
                                    hideSectionHeaders
                                    boldStyle
                                    shouldFocusOnSelectRow
                                    placeholderText={this.props.translate('optionsSelector.nameEmailOrPhoneNumber')}
                                />
                            ) : (
                                <FullScreenLoadingIndicator />
                            )}
                        </View>
                        <View style={[styles.flexShrink0]}>
                            <FormAlertWithSubmitButton
                                isDisabled={!this.state.selectedOptions.length || this.state.shouldDisableButton}
                                isAlertVisible={false}
                                buttonText={this.props.translate('common.invite')}
                                onSubmit={this.inviteUser}
                                message={this.props.policy.alertMessage}
                                containerStyles={[styles.flexReset, styles.mb0, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                                enabledWhenOffline
                            />
                            <Pressable
                                onPress={this.openPrivacyURL}
                                accessibilityRole="link"
                                href={CONST.PRIVACY_URL}
                                style={[styles.mh5, styles.mv2, styles.alignSelfStart]}
                            >
                                <View style={[styles.flexRow]}>
                                    <Text style={[styles.mr1, styles.label, styles.link]}>
                                        {this.props.translate('common.privacy')}
                                    </Text>
                                </View>
                            </Pressable>
                        </View>
                    </>
                )}
            </ScreenWrapper>
        );
    }
}

RoomInvitePage.propTypes = propTypes;
RoomInvitePage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withReportOrNavigateHome,
    withNetwork(),
    withOnyx({
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
    }),
)(RoomInvitePage);
