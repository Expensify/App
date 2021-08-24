import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import styles, {getNavigationModalCardStyle} from '../../../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import CONST from '../../../CONST';
import compose from '../../compose';
import {
    subscribeToUserEvents,
    fetchAllReports,
} from '../../actions/Report';
import * as PersonalDetails from '../../actions/PersonalDetails';
import * as Pusher from '../../Pusher/pusher';
import PusherConnectionManager from '../../PusherConnectionManager';
import UnreadIndicatorUpdater from '../../UnreadIndicatorUpdater';
import ROUTES from '../../../ROUTES';
import ONYXKEYS from '../../../ONYXKEYS';
import Timing from '../../actions/Timing';
import NetworkConnection from '../../NetworkConnection';
import CONFIG from '../../../CONFIG';
import {fetchCountryCodeByRequestIP} from '../../actions/GeoLocation';
import KeyboardShortcut from '../../KeyboardShortcut';
import Navigation from '../Navigation';
import * as User from '../../actions/User';
import {setModalVisibility} from '../../actions/Modal';
import NameValuePair from '../../actions/NameValuePair';
import {getPolicySummaries, getPolicyList} from '../../actions/Policy';
import modalCardStyleInterpolator from './modalCardStyleInterpolator';
import createCustomModalStackNavigator from './createCustomModalStackNavigator';
import Permissions from '../../Permissions';
import getOperatingSystem from '../../getOperatingSystem';

// Main drawer navigator
import MainDrawerNavigator from './MainDrawerNavigator';

// Validate login page
import ValidateLoginPage from '../../../pages/ValidateLoginPage';

// Modal Stack Navigators
import {
    IOUBillStackNavigator,
    IOURequestModalStackNavigator,
    IOUSendModalStackNavigator,
    IOUDetailsModalStackNavigator,
    DetailsModalStackNavigator,
    ReportParticipantsModalStackNavigator,
    SearchModalStackNavigator,
    NewGroupModalStackNavigator,
    NewChatModalStackNavigator,
    SettingsModalStackNavigator,
    EnablePaymentsStackNavigator,
    AddPersonalBankAccountModalStackNavigator,
    ReimbursementAccountModalStackNavigator,
    WorkspaceInviteModalStackNavigator,
    RequestCallModalStackNavigator,
    ReportDetailsModalStackNavigator,
    WorkspaceEditorNavigator,
} from './ModalStackNavigators';
import SCREENS from '../../../SCREENS';
import Timers from '../../Timers';
import LoginWithValidateCodePage from '../../../pages/LoginWithValidateCodePage';
import LoginWithValidateCode2FAPage from '../../../pages/LoginWithValidateCode2FAPage';
import WorkspaceSettingsDrawerNavigator from './WorkspaceSettingsDrawerNavigator';
import spacing from '../../../styles/utilities/spacing';
import CardOverlay from '../../../components/CardOverlay';
import defaultScreenOptions from './defaultScreenOptions';

const RootStack = createCustomModalStackNavigator();

// We want to delay the re-rendering for components(e.g. ReportActionCompose)
// that depends on modal visibility until Modal is completely closed and its focused
// When modal screen is focused, update modal visibility in Onyx
// https://reactnavigation.org/docs/navigation-events/
const modalScreenListeners = {
    focus: () => {
        setModalVisibility(true);
    },
    beforeRemove: () => {
        setModalVisibility(false);
    },
};

let hasLoadedPolicies = false;

/**
 * We want to only load policy info if you are in the freePlan beta.
 * @param {Array} betas
 */
function loadPoliciesBehindBeta(betas) {
    // When removing the freePlan beta, simply load the policyList and the policySummaries in componentDidMount().
    // Policy info loading should not be blocked behind the defaultRooms beta alone.
    if (!hasLoadedPolicies && (Permissions.canUseFreePlan(betas) || Permissions.canUseDefaultRooms(betas))) {
        getPolicyList();
        getPolicySummaries();
        hasLoadedPolicies = true;
    }
}

const propTypes = {
    /** Information about the network */
    network: PropTypes.shape({
        /** Is the network currently offline or not */
        isOffline: PropTypes.bool,
    }),

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    network: {isOffline: true},
    betas: [],
};

class AuthScreens extends React.Component {
    constructor(props) {
        super(props);

        Timing.start(CONST.TIMING.HOMEPAGE_INITIAL_RENDER);
        Timing.start(CONST.TIMING.HOMEPAGE_REPORTS_LOADED);
    }

    componentDidMount() {
        NetworkConnection.listenForReconnect();
        PusherConnectionManager.init();
        Pusher.init({
            appKey: CONFIG.PUSHER.APP_KEY,
            cluster: CONFIG.PUSHER.CLUSTER,
            authEndpoint: `${CONFIG.EXPENSIFY.URL_API_ROOT}api?command=Push_Authenticate`,
        }).then(() => {
            subscribeToUserEvents();
            User.subscribeToUserEvents();
        });

        // Fetch some data we need on initialization
        NameValuePair.get(CONST.NVP.PRIORITY_MODE, ONYXKEYS.NVP_PRIORITY_MODE, 'default');
        NameValuePair.get(CONST.NVP.PREFERRED_LOCALE, ONYXKEYS.NVP_PREFERRED_LOCALE, 'en');
        PersonalDetails.fetchPersonalDetails();
        User.getUserDetails();
        User.getBetas();
        User.getDomainInfo();
        PersonalDetails.fetchLocalCurrency();
        fetchAllReports(true, true);
        fetchCountryCodeByRequestIP();
        UnreadIndicatorUpdater.listenForReportChanges();

        loadPoliciesBehindBeta(this.props.betas);

        // Refresh the personal details, timezone and betas every 30 minutes
        // There is no pusher event that sends updated personal details data yet
        // See https://github.com/Expensify/ReactNativeChat/issues/468
        this.interval = Timers.register(setInterval(() => {
            if (this.props.network.isOffline) {
                return;
            }
            PersonalDetails.fetchPersonalDetails();
            User.getUserDetails();
            User.getBetas();
        }, 1000 * 60 * 30));

        Timing.end(CONST.TIMING.HOMEPAGE_INITIAL_RENDER);

        let searchShortcutModifiers = ['control'];
        let groupShortcutModifiers = ['control', 'shift'];

        if (getOperatingSystem() === CONST.OS.MAC_OS) {
            searchShortcutModifiers = ['meta'];
            groupShortcutModifiers = ['meta', 'shift'];
        }

        // Listen for the key K being pressed so that focus can be given to
        // the chat switcher, or new group chat
        // based on the key modifiers pressed and the operating system
        this.unsubscribeSearchShortcut = KeyboardShortcut.subscribe('K', () => {
            Navigation.navigate(ROUTES.SEARCH);
        }, searchShortcutModifiers, true);
        this.unsubscribeGroupShortcut = KeyboardShortcut.subscribe('K', () => {
            Navigation.navigate(ROUTES.NEW_GROUP);
        }, groupShortcutModifiers, true);
    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.isSmallScreenWidth !== this.props.isSmallScreenWidth) {
            return true;
        }

        if (nextProps.betas !== this.props.betas) {
            return true;
        }

        return false;
    }

    componentDidUpdate() {
        loadPoliciesBehindBeta(this.props.betas);
    }

    componentWillUnmount() {
        if (this.unsubscribeSearchShortcut) {
            this.unsubscribeSearchShortcut();
        }
        if (this.unsubscribeGroupShortcut) {
            this.unsubscribeGroupShortcut();
        }
        NetworkConnection.stopListeningForReconnect();
        clearInterval(this.interval);
        this.interval = null;
        hasLoadedPolicies = false;
    }

    render() {
        const commonModalScreenOptions = {
            headerShown: false,
            gestureDirection: 'horizontal',
            animationEnabled: true,

            // This option is required to make previous screen visible underneath the modal screen
            // https://reactnavigation.org/docs/6.x/stack-navigator#transparent-modals
            presentation: 'transparentModal',
        };
        const modalScreenOptions = {
            ...commonModalScreenOptions,
            cardStyle: getNavigationModalCardStyle(this.props.isSmallScreenWidth),
            cardStyleInterpolator: props => modalCardStyleInterpolator(this.props.isSmallScreenWidth, false, props),
            cardOverlayEnabled: true,

            // This is a custom prop we are passing to custom navigator so that we will know to add a Pressable overlay
            // when displaying a modal. This allows us to dismiss by clicking outside on web / large screens.
            isModal: true,
        };
        const fullscreenModalScreenOptions = {
            ...commonModalScreenOptions,
            cardStyle: {
                ...styles.fullscreenCard,
                padding: this.props.isSmallScreenWidth ? spacing.p0.padding : spacing.p5.padding,
            },
            cardStyleInterpolator: props => modalCardStyleInterpolator(this.props.isSmallScreenWidth, true, props),
            cardOverlayEnabled: !this.props.isSmallScreenWidth,
            isFullScreenModal: true,
            cardOverlay: CardOverlay,
        };

        return (
            <RootStack.Navigator
                mode="modal"

                // We are disabling the default keyboard handling here since the automatic behavior is to close a
                // keyboard that's open when swiping to dismiss a modal. In those cases, pressing the back button on
                // a header will briefly open and close the keyboard and crash Android.
                // eslint-disable-next-line react/jsx-props-no-multi-spaces
                keyboardHandlingEnabled={false}
            >
                {/* The MainDrawerNavigator contains the SidebarScreen and ReportScreen */}
                <RootStack.Screen
                    name={SCREENS.HOME}
                    options={{
                        headerShown: false,
                        title: 'New Expensify',

                        // prevent unnecessary scrolling
                        cardStyle: {
                            overflow: 'hidden',
                            height: '100%',
                        },
                    }}
                    component={MainDrawerNavigator}
                />
                <RootStack.Screen
                    name="ValidateLogin"
                    options={{
                        headerShown: false,
                        title: 'New Expensify',
                    }}
                    component={ValidateLoginPage}
                />
                <RootStack.Screen
                    name={SCREENS.LOGIN_WITH_VALIDATE_CODE_NEW_WORKSPACE}
                    options={defaultScreenOptions}
                    component={LoginWithValidateCodePage}
                />
                <RootStack.Screen
                    name={SCREENS.LOGIN_WITH_VALIDATE_CODE_2FA_NEW_WORKSPACE}
                    options={defaultScreenOptions}
                    component={LoginWithValidateCode2FAPage}
                />
                <RootStack.Screen
                    name={SCREENS.LOGIN_WITH_VALIDATE_CODE_WORKSPACE_CARD}
                    options={defaultScreenOptions}
                    component={LoginWithValidateCodePage}
                />
                <RootStack.Screen
                    name={SCREENS.LOGIN_WITH_VALIDATE_CODE_2FA_WORKSPACE_CARD}
                    options={defaultScreenOptions}
                    component={LoginWithValidateCode2FAPage}
                />

                {/* These are the various modal routes */}
                {/* Note: Each modal must have it's own stack navigator since we want to be able to navigate to any
                modal subscreens e.g. `/settings/profile` and this will allow us to navigate while inside the modal. We
                are also using a custom navigator on web so even if a modal does not have any subscreens it still must
                use a navigator */}
                <RootStack.Screen
                    name="WorkspaceSettings"
                    options={fullscreenModalScreenOptions}
                    component={WorkspaceSettingsDrawerNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="Settings"
                    options={modalScreenOptions}
                    component={SettingsModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="NewChat"
                    options={modalScreenOptions}
                    component={NewChatModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="NewGroup"
                    options={modalScreenOptions}
                    component={NewGroupModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="Search"
                    options={modalScreenOptions}
                    component={SearchModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="Details"
                    options={modalScreenOptions}
                    component={DetailsModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="Report_Details"
                    options={modalScreenOptions}
                    component={ReportDetailsModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="Participants"
                    options={modalScreenOptions}
                    component={ReportParticipantsModalStackNavigator}
                />
                <RootStack.Screen
                    name="IOU_Request"
                    options={modalScreenOptions}
                    component={IOURequestModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="IOU_Bill"
                    options={modalScreenOptions}
                    component={IOUBillStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="EnablePayments"
                    options={modalScreenOptions}
                    component={EnablePaymentsStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="IOU_Details"
                    options={modalScreenOptions}
                    component={IOUDetailsModalStackNavigator}
                />
                <RootStack.Screen
                    name="AddPersonalBankAccount"
                    options={modalScreenOptions}
                    component={AddPersonalBankAccountModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="ReimbursementAccount"
                    options={modalScreenOptions}
                    component={ReimbursementAccountModalStackNavigator}
                    listeners={modalScreenListeners}
                    initialParams={{stepToOpen: CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT}}
                />
                <RootStack.Screen
                    name="WorkspaceInvite"
                    options={modalScreenOptions}
                    component={WorkspaceInviteModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="RequestCall"
                    options={modalScreenOptions}
                    component={RequestCallModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="IOU_Send"
                    options={modalScreenOptions}
                    component={IOUSendModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="WorkspaceEditor"
                    options={modalScreenOptions}
                    component={WorkspaceEditorNavigator}
                    listeners={modalScreenListeners}
                />
            </RootStack.Navigator>
        );
    }
}

AuthScreens.propTypes = propTypes;
AuthScreens.defaultProps = defaultProps;
export default compose(
    withWindowDimensions,
    withOnyx({
        network: {
            key: ONYXKEYS.NETWORK,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(AuthScreens);
