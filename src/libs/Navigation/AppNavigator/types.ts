import {DefaultNavigatorOptions, DefaultRouterOptions, NavigatorScreenParams, ParamListBase, StackNavigationState} from '@react-navigation/native';
import {StackNavigationEventMap, StackNavigationOptions, StackScreenProps} from '@react-navigation/stack';
import {ValueOf} from 'type-fest';
import CONST from '../../../CONST';
import NAVIGATORS from '../../../NAVIGATORS';
import SCREENS from '../../../SCREENS';

type AccountValidationParams = {
    /** AccountID associated with the validation link */
    accountID: string;

    /** Validation code associated with the validation link */
    validateCode: string;
};

type CentralPaneStackParamList = {
    [SCREENS.REPORT]: {
        /** If the admin room should be opened */
        openOnAdminRoom?: boolean;

        /** The ID of the report this screen should display */
        reportID: string;
    };
};
type ReportScreenWrapperProps = StackScreenProps<CentralPaneStackParamList, typeof SCREENS.REPORT>;

type PublicScreensStackParamList = {
    [SCREENS.HOME]: undefined;
    [SCREENS.TRANSITION_BETWEEN_APPS]: {
        /** Short-lived authToken to sign in a user */
        shortLivedAuthToken: string;

        /** Short-lived authToken to sign in as a user, if they are coming from the old mobile app */
        shortLivedToken: string;

        /** The email of the transitioning user */
        email: string;
    };
    [SCREENS.VALIDATE_LOGIN]: AccountValidationParams;
    [SCREENS.UNLINK_LOGIN]: AccountValidationParams;
    [SCREENS.SIGN_IN_WITH_APPLE_DESKTOP]: undefined;
    [SCREENS.SIGN_IN_WITH_GOOGLE_DESKTOP]: undefined;
    [SCREENS.SAML_SIGN_IN]: undefined;
};

type AuthScreensStackParamList = {
    [SCREENS.HOME]: undefined;
    [NAVIGATORS.CENTRAL_PANE_NAVIGATOR]: NavigatorScreenParams<CentralPaneStackParamList>;
    [SCREENS.VALIDATE_LOGIN]: AccountValidationParams;
    [SCREENS.TRANSITION_BETWEEN_APPS]: undefined;
    [SCREENS.CONCIERGE]: undefined;
    [CONST.DEMO_PAGES.SAASTR]: {name: string};
    [CONST.DEMO_PAGES.SBE]: {name: string};
    [SCREENS.REPORT_ATTACHMENTS]: {
        /** The report ID which the attachment is associated with */
        reportID: string;

        /** The uri encoded source of the attachment */
        source: string;
    };
    [SCREENS.NOT_FOUND]: undefined;
    [CONST.DEMO_PAGES.MONEY2020]: undefined;
    [NAVIGATORS.RIGHT_MODAL_NAVIGATOR]: NavigatorScreenParams<RightModalNavigatorStackParamList>;
    [SCREENS.DESKTOP_SIGN_IN_REDIRECT]: undefined;
};

// TODO: describe all of the nested navigators
type RightModalNavigatorStackParamList = Record<ValueOf<typeof SCREENS.RIGHT_MODAL>, undefined>;

type ResponsiveStackNavigatorConfig = {
    isSmallScreenWidth: boolean;
};
type ResponsiveStackNavigatorRouterOptions = DefaultRouterOptions & {
    getIsSmallScreenWidth: () => boolean;
};
type ResponsiveStackNavigatorProps = DefaultNavigatorOptions<ParamListBase, StackNavigationState<ParamListBase>, StackNavigationOptions, StackNavigationEventMap> &
    ResponsiveStackNavigatorConfig;

export type {
    CentralPaneStackParamList,
    ReportScreenWrapperProps,
    PublicScreensStackParamList,
    RightModalNavigatorStackParamList,
    ResponsiveStackNavigatorRouterOptions,
    ResponsiveStackNavigatorProps,
    ResponsiveStackNavigatorConfig,
    AuthScreensStackParamList,
};
