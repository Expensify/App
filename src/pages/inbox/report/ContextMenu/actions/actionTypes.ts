import type {RefObject} from 'react';
import type {GestureResponderEvent, View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import type useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import type {Beta, Card, Download as DownloadOnyx, IntroSelected, Policy, PolicyTagLists, ReportAction, ReportActions, Report as ReportType, Transaction} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import type {ContextMenuAnchor, ContextMenuType} from '../ReportActionContextMenu';

const CONTEXT_MENU_ICON_NAMES = [
    'Bell',
    'Bug',
    'ChatBubbleReply',
    'ChatBubbleUnread',
    'Checkmark',
    'Concierge',
    'Copy',
    'Download',
    'Exit',
    'Flag',
    'LinkCopy',
    'Mail',
    'Pencil',
    'Pin',
    'Stopwatch',
    'ThreeDots',
    'Trashcan',
] as const;

type ContextMenuIconName = (typeof CONTEXT_MENU_ICON_NAMES)[number];

type ContextMenuIcons = Record<ContextMenuIconName, IconAsset>;

type ContextMenuPayload = {
    type: ContextMenuType;
    reportID: string | undefined;
    originalReportID: string | undefined;

    reportActions: OnyxEntry<ReportActions>;
    reportAction: ReportAction;
    report: OnyxEntry<ReportType>;
    originalReport: OnyxEntry<ReportType>;
    childReport: OnyxEntry<ReportType>;
    childReportActions: OnyxCollection<ReportAction>;

    moneyRequestAction: ReportAction | undefined;
    moneyRequestReport: OnyxEntry<ReportType>;
    moneyRequestPolicy: OnyxEntry<Policy>;
    iouTransaction: OnyxEntry<Transaction>;
    transaction: OnyxEntry<Transaction>;
    card: Card | undefined;

    currentUserAccountID: number;
    currentUserPersonalDetails: ReturnType<typeof useCurrentUserPersonalDetails>;
    encryptedAuthToken: string;

    isArchivedRoom: boolean;
    isChronosReport: boolean;
    isPinnedChat: boolean;
    isUnreadChat: boolean;
    isThreadReportParentAction: boolean;
    isOffline: boolean;
    isProduction: boolean;
    isHarvestReport: boolean;
    isTryNewDotNVPDismissed: boolean;
    isDelegateAccessRestricted: boolean;
    areHoldRequirementsMet: boolean;
    isDebugModeEnabled: OnyxEntry<boolean>;

    betas: OnyxEntry<Beta[]>;
    transactions: OnyxCollection<Transaction>;
    introSelected: OnyxEntry<IntroSelected>;
    draftMessage: string;
    selection: string;

    movedFromReport: OnyxEntry<ReportType>;
    movedToReport: OnyxEntry<ReportType>;
    harvestReport: OnyxEntry<ReportType>;

    download: OnyxEntry<DownloadOnyx>;

    close: () => void;
    hideAndRun: (callback?: () => void) => void;
    transitionActionSheetState: (params: {type: string; payload?: Record<string, unknown>}) => void;
    openContextMenu: () => void;
    interceptAnonymousUser: (callback: () => void, isAnonymousAction?: boolean) => void;
    openOverflowMenu: (event: GestureResponderEvent | MouseEvent, anchorRef: RefObject<View | null>) => void;
    setIsEmojiPickerActive: ((state: boolean) => void) | undefined;
    showDelegateNoAccessModal: (() => void) | undefined;

    translate: LocalizedTranslate;
    getLocalDateFromDatetime: LocaleContextProps['getLocalDateFromDatetime'];
    policy: OnyxEntry<Policy>;
    policyTags: OnyxEntry<PolicyTagLists>;

    anchor: RefObject<ContextMenuAnchor> | undefined;

    disabledActionIDs: Set<string>;
};

type ContextMenuActionParams = {
    payload: ContextMenuPayload;
    icons: ContextMenuIcons;
};

export {CONTEXT_MENU_ICON_NAMES};
export type {ContextMenuActionParams, ContextMenuPayload, ContextMenuIcons, ContextMenuIconName};
