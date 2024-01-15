import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {
    AuthenticatePusherParams,
    GetMissingOnyxMessagesParams,
    HandleRestrictedEventParams,
    OpenAppParams,
    OpenOldDotLinkParams,
    OpenProfileParams,
    OpenReportParams,
    ReconnectAppParams,
    RevealExpensifyCardDetailsParams,
    UpdatePreferredLocaleParams,
} from './parameters';

type ApiRequestWithSideEffects = ValueOf<typeof CONST.API_REQUEST_TYPE, 'MAKE_REQUEST_WITH_SIDE_EFFECTS' | 'READ'>;

const WRITE_COMMANDS = {
    UPDATE_PREFERRED_LOCALE: 'UpdatePreferredLocale',
    RECONNECT_APP: 'ReconnectApp',
    OPEN_PROFILE: 'OpenProfile',
    HANDLE_RESTRICTED_EVENT: 'HandleRestrictedEvent',
    OPEN_REPORT: 'OpenReport',
} as const;

type WriteCommand = ValueOf<typeof WRITE_COMMANDS>;

type WriteCommandParameters = {
    [WRITE_COMMANDS.UPDATE_PREFERRED_LOCALE]: UpdatePreferredLocaleParams;
    [WRITE_COMMANDS.RECONNECT_APP]: ReconnectAppParams;
    [WRITE_COMMANDS.OPEN_PROFILE]: OpenProfileParams;
    [WRITE_COMMANDS.HANDLE_RESTRICTED_EVENT]: HandleRestrictedEventParams;
    [WRITE_COMMANDS.OPEN_REPORT]: HandleRestrictedEventParams;
};

const READ_COMMANDS = {
    OPEN_APP: 'OpenApp',
} as const;

type ReadCommand = ValueOf<typeof READ_COMMANDS>;

type ReadCommandParameters = {
    [READ_COMMANDS.OPEN_APP]: OpenAppParams;
};

const SIDE_EFFECT_REQUEST_COMMANDS = {
    AUTHENTICATE_PUSHER: 'AuthenticatePusher',
    OPEN_REPORT: 'OpenReport',
    OPEN_OLD_DOT_LINK: 'OpenOldDotLink',
    REVEAL_EXPENSIFY_CARD_DETAILS: 'RevealExpensifyCardDetails',
    GET_MISSING_ONYX_MESSAGES: 'GetMissingOnyxMessages',
    RECONNECT_APP: 'ReconnectApp',
} as const;

type SideEffectRequestCommand = ReadCommand | ValueOf<typeof SIDE_EFFECT_REQUEST_COMMANDS>;

type SideEffectRequestCommandParameters = ReadCommandParameters & {
    [SIDE_EFFECT_REQUEST_COMMANDS.AUTHENTICATE_PUSHER]: AuthenticatePusherParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.OPEN_REPORT]: OpenReportParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.OPEN_OLD_DOT_LINK]: OpenOldDotLinkParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.REVEAL_EXPENSIFY_CARD_DETAILS]: RevealExpensifyCardDetailsParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.GET_MISSING_ONYX_MESSAGES]: GetMissingOnyxMessagesParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP]: ReconnectAppParams;
};

export {WRITE_COMMANDS, READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS};

export type {ApiRequestWithSideEffects, WriteCommand, WriteCommandParameters, ReadCommand, ReadCommandParameters, SideEffectRequestCommand, SideEffectRequestCommandParameters};
