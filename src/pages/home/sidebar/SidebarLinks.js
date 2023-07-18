/* eslint-disable rulesdir/onyx-props-must-have-default */
import lodashGet from 'lodash/get';
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import ONYXKEYS from '../../../ONYXKEYS';
import safeAreaInsetPropTypes from '../../safeAreaInsetPropTypes';
import compose from '../../../libs/compose';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import Icon from '../../../components/Icon';
import * as Expensicons from '../../../components/Icon/Expensicons';
import AvatarWithIndicator from '../../../components/AvatarWithIndicator';
import Tooltip from '../../../components/Tooltip';
import CONST from '../../../CONST';
import participantPropTypes from '../../../components/participantPropTypes';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as App from '../../../libs/actions/App';
import withCurrentUserPersonalDetails from '../../../components/withCurrentUserPersonalDetails';
import withWindowDimensions from '../../../components/withWindowDimensions';
import LHNOptionsList from '../../../components/LHNOptionsList/LHNOptionsList';
import SidebarUtils from '../../../libs/SidebarUtils';
import reportPropTypes from '../../reportPropTypes';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import withNavigationFocus from '../../../components/withNavigationFocus';
import withCurrentReportID, {withCurrentReportIDPropTypes, withCurrentReportIDDefaultProps} from '../../../components/withCurrentReportID';
import withNavigation, {withNavigationPropTypes} from '../../../components/withNavigation';
import Header from '../../../components/Header';
import defaultTheme from '../../../styles/themes/default';
import OptionsListSkeletonView from '../../../components/OptionsListSkeletonView';
import variables from '../../../styles/variables';
import LogoComponent from '../../../../assets/images/expensify-wordmark.svg';
import PressableWithoutFeedback from '../../../components/Pressable/PressableWithoutFeedback';
import * as Session from '../../../libs/actions/Session';
import Button from '../../../components/Button';
import * as UserUtils from '../../../libs/UserUtils';
import KeyboardShortcut from '../../../libs/KeyboardShortcut';

const propTypes = {
    /** Toggles the navigation menu open and closed */
    onLinkClick: PropTypes.func.isRequired,

    /** Safe area insets required for mobile devices margins */
    insets: safeAreaInsetPropTypes.isRequired,

    /* Onyx Props */
    /** List of reports */
    // eslint-disable-next-line react/no-unused-prop-types
    chatReports: PropTypes.objectOf(reportPropTypes),

    /** All report actions for all reports */
    // eslint-disable-next-line react/no-unused-prop-types
    reportActions: PropTypes.objectOf(
        PropTypes.arrayOf(
            PropTypes.shape({
                error: PropTypes.string,
                message: PropTypes.arrayOf(
                    PropTypes.shape({
                        moderationDecisions: PropTypes.arrayOf(
                            PropTypes.shape({
                                decision: PropTypes.string,
                            }),
                        ),
                    }),
                ),
            }),
        ),
    ),

    /** List of users' personal details */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The personal details of the person who is logged in */
    currentUserPersonalDetails: PropTypes.shape({
        /** Display name of the current user */
        displayName: PropTypes.string,

        /** Avatar URL or SVG of the current user */
        avatar: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

        /** Login email of the current user */
        login: PropTypes.string,

        /** AccountID of the current user */
        accountID: PropTypes.number,
    }),

    /** Whether we are viewing below the responsive breakpoint */
    isSmallScreenWidth: PropTypes.bool.isRequired,

    /** The chat priority mode */
    priorityMode: PropTypes.string,

    /** Details about any modals being used */
    modal: PropTypes.shape({
        /** Indicates when an Alert modal is about to be visible */
        willAlertModalBecomeVisible: PropTypes.bool,
    }),

    ...withCurrentReportIDPropTypes,
    ...withLocalizePropTypes,
    ...withNavigationPropTypes,
};

const defaultProps = {
    chatReports: {},
    reportActions: {},
    personalDetails: {},
    currentUserPersonalDetails: {
        avatar: '',
    },
    priorityMode: CONST.PRIORITY_MODE.DEFAULT,
    modal: {},
    ...withCurrentReportIDDefaultProps,
};

class SidebarLinks extends React.Component {
    constructor(props) {
        super(props);

        this.showSearchPage = this.showSearchPage.bind(this);
        this.showSettingsPage = this.showSettingsPage.bind(this);
        this.showReportPage = this.showReportPage.bind(this);

        if (this.props.isSmallScreenWidth) {
            App.confirmReadyToOpenApp();
        }
    }

    componentDidMount() {
        App.setSidebarLoaded();
        SidebarUtils.setIsSidebarLoadedReady();
        this.isSidebarLoaded = true;

        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.ESCAPE;
        this.unsubscribeEscapeKey = KeyboardShortcut.subscribe(
            shortcutConfig.shortcutKey,
            () => {
                if (this.props.modal.willAlertModalBecomeVisible) {
                    return;
                }

                Navigation.dismissModal();
            },
            shortcutConfig.descriptionKey,
            shortcutConfig.modifiers,
            true,
            true,
        );
    }

    componentWillUnmount() {
        SidebarUtils.resetIsSidebarLoadedReadyPromise();
        if (this.unsubscribeEscapeKey) {
            this.unsubscribeEscapeKey();
        }
    }

    showSearchPage() {
        if (this.props.isCreateMenuOpen) {
            // Prevent opening Search page when click Search icon quickly after clicking FAB icon
            return;
        }

        Navigation.navigate(ROUTES.SEARCH);
    }

    showSettingsPage() {
        if (this.props.isCreateMenuOpen) {
            // Prevent opening Settings page when click profile avatar quickly after clicking FAB icon
            return;
        }

        Navigation.navigate(ROUTES.SETTINGS);
    }

    /**
     * Show Report page with selected report id
     *
     * @param {Object} option
     * @param {String} option.reportID
     */
    showReportPage(option) {
        // Prevent opening Report page when clicking LHN row quickly after clicking FAB icon
        // or when clicking the active LHN row
        // or when continuously clicking different LHNs, only apply to small screen
        // since getTopmostReportId always returns on other devices
        if (this.props.isCreateMenuOpen || this.props.currentReportID === option.reportID || (this.props.isSmallScreenWidth && Navigation.getTopmostReportId())) {
            return;
        }
        Navigation.navigate(ROUTES.getReportRoute(option.reportID));
        this.props.onLinkClick();
    }

    render() {
        const isLoading = _.isEmpty(this.props.personalDetails) || _.isEmpty(this.props.chatReports);
        const optionListItems = SidebarUtils.getOrderedReportIDs(this.props.currentReportID);
        const skeletonPlaceholder = <OptionsListSkeletonView shouldAnimate />;

        return (
            <View
                accessibilityElementsHidden={!this.props.isFocused}
                accessibilityLabel={this.props.translate('sidebarScreen.listOfChats')}
                style={[styles.flex1, styles.h100]}
            >
                <View
                    style={[styles.flexRow, styles.ph5, styles.pv3, styles.justifyContentBetween, styles.alignItemsCenter]}
                    nativeID="drag-area"
                >
                    <Header
                        title={
                            <LogoComponent
                                fill={defaultTheme.textLight}
                                width={variables.lhnLogoWidth}
                                height={variables.lhnLogoHeight}
                            />
                        }
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        shouldShowEnvironmentBadge
                    />
                    <Tooltip text={this.props.translate('common.search')}>
                        <PressableWithoutFeedback
                            accessibilityLabel={this.props.translate('sidebarScreen.buttonSearch')}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                            style={[styles.flexRow, styles.ph5]}
                            onPress={Session.checkIfActionIsAllowed(this.showSearchPage)}
                        >
                            <Icon src={Expensicons.MagnifyingGlass} />
                        </PressableWithoutFeedback>
                    </Tooltip>
                    <PressableWithoutFeedback
                        accessibilityLabel={this.props.translate('sidebarScreen.buttonMySettings')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        onPress={Session.checkIfActionIsAllowed(this.showSettingsPage)}
                    >
                        {Session.isAnonymousUser() ? (
                            <View style={styles.signInButtonAvatar}>
                                <Button
                                    medium
                                    success
                                    text={this.props.translate('common.signIn')}
                                    onPress={() => Session.signOutAndRedirectToSignIn()}
                                />
                            </View>
                        ) : (
                            <OfflineWithFeedback pendingAction={lodashGet(this.props.currentUserPersonalDetails, 'pendingFields.avatar', null)}>
                                <AvatarWithIndicator
                                    source={UserUtils.getAvatar(this.props.currentUserPersonalDetails.avatar, this.props.currentUserPersonalDetails.accountID)}
                                    tooltipText={this.props.translate('common.settings')}
                                />
                            </OfflineWithFeedback>
                        )}
                    </PressableWithoutFeedback>
                </View>
                {isLoading ? (
                    skeletonPlaceholder
                ) : (
                    <LHNOptionsList
                        contentContainerStyles={[styles.sidebarListContainer, {paddingBottom: StyleUtils.getSafeAreaMargins(this.props.insets).marginBottom}]}
                        data={optionListItems}
                        focusedIndex={_.findIndex(optionListItems, (option) => option.toString() === this.props.currentReportID)}
                        onSelectRow={this.showReportPage}
                        shouldDisableFocusOptions={this.props.isSmallScreenWidth}
                        optionMode={this.props.priorityMode === CONST.PRIORITY_MODE.GSD ? CONST.OPTION_MODE.COMPACT : CONST.OPTION_MODE.DEFAULT}
                    />
                )}
            </View>
        );
    }
}

SidebarLinks.propTypes = propTypes;
SidebarLinks.defaultProps = defaultProps;

/**
 * This function (and the few below it), narrow down the data from Onyx to just the properties that we want to trigger a re-render of the component. This helps minimize re-rendering
 * and makes the entire component more performant because it's not re-rendering when a bunch of properties change which aren't ever used in the UI.
 * @param {Object} [report]
 * @returns {Object|undefined}
 */
const chatReportSelector = (report) =>
    report && {
        reportID: report.reportID,
        participantAccountIDs: report.participantAccountIDs,
        hasDraft: report.hasDraft,
        isPinned: report.isPinned,
        errorFields: {
            addWorkspaceRoom: report.errorFields && report.errorFields.addWorkspaceRoom,
        },
        lastReadTime: report.lastReadTime,
        lastMentionedTime: report.lastMentionedTime,
        lastMessageText: report.lastMessageText,
        lastVisibleActionCreated: report.lastVisibleActionCreated,
        iouReportID: report.iouReportID,
        hasOutstandingIOU: report.hasOutstandingIOU,
        statusNum: report.statusNum,
        stateNum: report.stateNum,
        chatType: report.chatType,
        policyID: report.policyID,
        reportName: report.reportName,
        managerEmail: report.managerEmail,
    };

/**
 * @param {Object} [personalDetails]
 * @returns {Object|undefined}
 */
const personalDetailsSelector = (personalDetails) =>
    _.reduce(
        personalDetails,
        (finalPersonalDetails, personalData, accountID) => {
            // It's OK to do param-reassignment in _.reduce() because we absolutely know the starting state of finalPersonalDetails
            // eslint-disable-next-line no-param-reassign
            finalPersonalDetails[accountID] = {
                accountID: Number(accountID),
                login: personalData.login,
                displayName: personalData.displayName,
                firstName: personalData.firstName,
                avatar: UserUtils.getAvatar(personalData.avatar, personalData.accountID),
            };
            return finalPersonalDetails;
        },
        {},
    );

/**
 * @param {Object} [reportActions]
 * @returns {Object|undefined}
 */
const reportActionsSelector = (reportActions) =>
    reportActions &&
    _.map(reportActions, (reportAction) => ({
        errors: reportAction.errors,
        message: [
            {
                moderationDecisions: [{decision: lodashGet(reportAction, 'message[0].moderationDecisions[0].decision')}],
            },
        ],
    }));

/**
 * @param {Object} [policy]
 * @returns {Object|undefined}
 */
const policySelector = (policy) =>
    policy && {
        type: policy.type,
        name: policy.name,
        avatar: policy.avatar,
    };

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
    withNavigationFocus,
    withWindowDimensions,
    withCurrentReportID,
    withNavigation,
    withOnyx({
        // Note: It is very important that the keys subscribed to here are the same
        // keys that are subscribed to at the top of SidebarUtils.js. If there was a key missing from here and data was updated
        // for that key, then there would be no re-render and the options wouldn't reflect the new data because SidebarUtils.getOrderedReportIDs() wouldn't be triggered.
        // This could be changed if each OptionRowLHN used withOnyx() to connect to the Onyx keys, but if you had 10,000 reports
        // with 10,000 withOnyx() connections, it would have unknown performance implications.
        chatReports: {
            key: ONYXKEYS.COLLECTION.REPORT,
            selector: chatReportSelector,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            selector: personalDetailsSelector,
        },
        priorityMode: {
            key: ONYXKEYS.NVP_PRIORITY_MODE,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
        reportActions: {
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
            selector: reportActionsSelector,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
            selector: policySelector,
        },
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
        modal: {
            key: ONYXKEYS.MODAL,
        },
    }),
)(SidebarLinks);
