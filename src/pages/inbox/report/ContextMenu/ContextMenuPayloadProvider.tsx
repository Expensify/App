import type {RefObject} from 'react';
import {createContext, useContext} from 'react';
import type {GestureResponderEvent, View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import type useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import type {Beta, Card, Download as DownloadOnyx, IntroSelected, Policy, PolicyTagLists, ReportAction, ReportActions, Report as ReportType, Transaction} from '@src/types/onyx';
import type {ContextMenuAnchor, ContextMenuType} from './ReportActionContextMenu';

type ContextMenuPayloadContextValue = {
    type: ContextMenuType;
    reportID: string | undefined;
    originalReportID: string | undefined;

    reportActions: OnyxEntry<ReportActions>;
    reportAction: ReportAction;
    report: OnyxEntry<ReportType>;
    originalReport: OnyxEntry<ReportType>;
    childReport: OnyxEntry<ReportType>;
    childReportActions: OnyxCollection<ReportAction>;

    policy: OnyxEntry<Policy>;
    policyTags: OnyxEntry<PolicyTagLists>;

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
    isMini: boolean;
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
    transitionActionSheetState: (params: {type: string; payload?: Record<string, unknown>}) => void;
    openContextMenu: () => void;
    interceptAnonymousUser: (callback: () => void, isAnonymousAction?: boolean) => void;
    openOverflowMenu: (event: GestureResponderEvent | MouseEvent, anchorRef: RefObject<View | null>, miniVisibleActionIds?: Set<string>) => void;
    setIsEmojiPickerActive: ((state: boolean) => void) | undefined;
    showDelegateNoAccessModal: (() => void) | undefined;

    translate: LocalizedTranslate;
    getLocalDateFromDatetime: LocaleContextProps['getLocalDateFromDatetime'];

    anchor: RefObject<ContextMenuAnchor> | undefined;

    disabledActionIds: Set<string>;
};

const ContextMenuPayloadContext = createContext<ContextMenuPayloadContextValue | null>(null);

function useContextMenuPayload(): ContextMenuPayloadContextValue {
    const ctx = useContext(ContextMenuPayloadContext);
    if (ctx === null) {
        throw new Error('useContextMenuPayload must be used within a ContextMenuPayloadProvider');
    }
    return ctx;
}

export {ContextMenuPayloadContext, useContextMenuPayload};
export type {ContextMenuPayloadContextValue};
