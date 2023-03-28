import _ from 'underscore';
import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import OptionsSelector from '../components/OptionsSelector';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import * as Report from '../libs/actions/Report';
import CONST from '../CONST';
import withWindowDimensions, {windowDimensionsPropTypes} from '../components/withWindowDimensions';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import ScreenWrapper from '../components/ScreenWrapper';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import personalDetailsPropType from './personalDetailsPropType';
import reportPropTypes from './reportPropTypes';

const propTypes = {
    /** Whether screen is used to create group chat */
    isGroupChat: PropTypes.bool,

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** All of the personal details for everyone */
    personalDetails: personalDetailsPropType,

    /** All reports shared with the user */
    reports: PropTypes.objectOf(reportPropTypes),

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isGroupChat: false,
    betas: [],
    personalDetails: {},
    reports: {},
};

const NewChatPage = (props) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [recentReports, setRecentReports] = useState(initialRecentReports);
    const [personalDetails, setPersonalDetails] = useState(initialPersonalDetails);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [userToInvite, setUserToInvite] = useState(initialUserToInvite);

    const excludedGroupEmails = _.without(CONST.EXPENSIFY_EMAILS, CONST.EMAIL.CONCIERGE);

    useEffect(() => {
        const {
            recentReports,
            personalDetails,
            userToInvite,
        } = OptionsListUtils.getNewChatOptions(
            props.reports,
            props.personalDetails,
            props.betas,
            '',
            [],
            props.isGroupChat ? excludedGroupEmails : [],
        );

        setRecentReports(recentReports);
        setPersonalDetails(personalDetails);
        setUserToInvite(userToInvite);
    }, []);

    /**
     * Returns the sections needed for the OptionsSelector
     *
     * @param {Boolean} maxParticipantsReached
     * @returns {Array}
     */
    function getSections(maxParticipantsReached) {
        const sections = [];
        let indexOffset = 0;

        if (props.isGroupChat) {
            sections.push({
                title: undefined,
                data: selectedOptions,
                shouldShow: !_.isEmpty(selectedOptions),
                indexOffset,
            });
            indexOffset += selectedOptions.length;

            if (maxParticipantsReached) {
                return sections;
            }
        }

        // Filtering out selected users from the search results
        const filterText = _.reduce(selectedOptions, (str, {login}) => `${str} ${login}`, '');
        const recentReportsWithoutSelected = _.filter(recentReports, ({login}) => !filterText.includes(login));
        const personalDetailsWithoutSelected = _.filter(personalDetails, ({login}) => !filterText.includes(login));
        const hasUnselectedUserToInvite = userToInvite && !filterText.includes(userToInvite.login);

        sections.push({
            title: props.translate('common.recents'),
            data: recentReportsWithoutSelected,
            shouldShow: !_.isEmpty(recentReportsWithoutSelected),
            indexOffset,
        });
        indexOffset += recentReportsWithoutSelected.length;

        sections.push({
            title: props.translate('common.contacts'),
            data: personalDetailsWithoutSelected,
            shouldShow: !_.isEmpty(personalDetailsWithoutSelected),
            indexOffset,
        });
        indexOffset += personalDetailsWithoutSelected.length;

        if (hasUnselectedUserToInvite) {
            sections.push(({
                title: undefined,
                data: [userToInvite],
                shouldShow: true,
                indexOffset,
            }));
        }

        return sections;
    }

    function updateOptionsWithSearchTerm(searchTerm = '') {
        const {
            recentReports,
            personalDetails,
            userToInvite,
        } = OptionsListUtils.getNewChatOptions(
            props.reports,
            props.personalDetails,
            props.betas,
            searchTerm,
            [],
            props.isGroupChat ? excludedGroupEmails : [],
        );

        setSearchTerm(searchTerm);
        setRecentReports(recentReports);
        setPersonalDetails(personalDetails);
        setUserToInvite(userToInvite);
    }

    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     * @param {Object} option
     */
    function toggleOption(option) {
        this.setState((prevState) => {
            const isOptionInList = _.some(prevState.selectedOptions, selectedOption => (
                selectedOption.login === option.login
            ));

            let newSelectedOptions;

            if (isOptionInList) {
                newSelectedOptions = _.reject(prevState.selectedOptions, selectedOption => (
                    selectedOption.login === option.login
                ));
            } else {
                newSelectedOptions = [...prevState.selectedOptions, option];
            }

            const {
                recentReports,
                personalDetails,
                userToInvite,
            } = OptionsListUtils.getNewChatOptions(
                props.reports,
                props.personalDetails,
                props.betas,
                prevState.searchTerm,
                [],
                excludedGroupEmails,
            );

            return {
                selectedOptions: newSelectedOptions,
                recentReports,
                personalDetails,
                userToInvite,
                searchTerm: prevState.searchTerm,
            };
        });
    }

    /**
     * Creates a new 1:1 chat with the option and the current user,
     * or navigates to the existing chat if one with those participants already exists.
     *
     * @param {Object} option
     */
    function createChat(option) {
        Report.navigateToAndOpenReport([option.login]);
    }

    /**
     * Creates a new group chat with all the selected options and the current user,
     * or navigates to the existing chat if one with those participants already exists.
     */
    function createGroup() {
        if (!props.isGroupChat) {
            return;
        }

        const userLogins = _.pluck(selectedOptions, 'login');
        if (userLogins.length < 1) {
            return;
        }
        Report.navigateToAndOpenReport(userLogins);
    }
    const maxParticipantsReached = selectedOptions.length === CONST.REPORT.MAXIMUM_PARTICIPANTS;
    const sections = this.getSections(maxParticipantsReached);
    const headerMessage = OptionsListUtils.getHeaderMessage(
        (personalDetails.length + recentReports.length) !== 0,
        Boolean(userToInvite),
        searchTerm,
        maxParticipantsReached,
    );
    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({didScreenTransitionEnd, safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithCloseButton
                        title={props.isGroupChat
                            ? props.translate('sidebarScreen.newGroup')
                            : props.translate('sidebarScreen.newChat')}
                        onCloseButtonPress={() => Navigation.dismissModal(true)}
                    />
                    <View style={[styles.flex1, styles.w100, styles.pRelative, selectedOptions.length > 0 ? safeAreaPaddingBottomStyle : {}]}>
                        {didScreenTransitionEnd ? (
                            <OptionsSelector
                                canSelectMultipleOptions={props.isGroupChat}
                                sections={sections}
                                selectedOptions={selectedOptions}
                                value={searchTerm}
                                onSelectRow={option => (props.isGroupChat ? this.toggleOption(option) : this.createChat(option))}
                                onChangeText={this.updateOptionsWithSearchTerm}
                                headerMessage={headerMessage}
                                boldStyle
                                shouldFocusOnSelectRow={props.isGroupChat}
                                shouldShowConfirmButton={props.isGroupChat}
                                confirmButtonText={props.translate('newChatPage.createGroup')}
                                onConfirmSelection={this.createGroup}
                                placeholderText={props.translate('optionsSelector.nameEmailOrPhoneNumber')}
                                safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                            />
                        ) : (
                            <FullScreenLoadingIndicator />
                        )}
                    </View>
                </>
            )}
        </ScreenWrapper>
    );
};

NewChatPage.displayName = 'NewChatPage';
NewChatPage.propTypes = propTypes;
NewChatPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withWindowDimensions,
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(NewChatPage);
