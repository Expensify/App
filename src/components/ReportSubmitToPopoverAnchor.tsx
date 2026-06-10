import type {RefObject} from 'react';
import React, {createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import useReportSubmitToPopover from '@hooks/useReportSubmitToPopover';
import type {ReportSubmitToPopoverOpenOptions} from '@hooks/useReportSubmitToPopover';
import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

/** Positions the submit-to popover below the Search row Submit button (wide layout). */
const SEARCH_REPORT_SUBMIT_TO_POPOVER_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type OpenReportSubmitToPopover = (options?: ReportSubmitToPopoverOpenOptions) => void;

const ReportSubmitToPopoverContext = createContext<OpenReportSubmitToPopover>(() => {
    // Default: no provider (tests / edge UI). Opening is a no-op.
});

const ReportSubmitToPopoverAnchorRefContext = createContext<RefObject<View | null> | null>(null);

type ReportSubmitToPopoverHostContextValue = {
    registerAnchor: (reportID: string | undefined, anchorRef: RefObject<View | null>) => () => void;
    openReportSubmitToPopover: (reportID: string | undefined, options?: ReportSubmitToPopoverOpenOptions) => void;
};

const ReportSubmitToPopoverHostContext = createContext<ReportSubmitToPopoverHostContextValue | null>(null);

type SearchSubmitPopoverGuardContextValue = {
    isReportSubmitToPopoverVisible: boolean;
    consumeIgnoreNextSearchSubmitPress: () => boolean;
};

const defaultSearchSubmitPopoverGuard: SearchSubmitPopoverGuardContextValue = {
    isReportSubmitToPopoverVisible: false,
    consumeIgnoreNextSearchSubmitPress: () => false,
};

const SearchSubmitPopoverGuardContext = createContext<SearchSubmitPopoverGuardContextValue>(defaultSearchSubmitPopoverGuard);

function useSearchSubmitPopoverGuard(): SearchSubmitPopoverGuardContextValue {
    return useContext(SearchSubmitPopoverGuardContext);
}

function SearchSubmitPopoverGuardProvider({guard, children}: {guard: SearchSubmitPopoverGuardContextValue; children: React.ReactNode}) {
    return <SearchSubmitPopoverGuardContext.Provider value={guard}>{children}</SearchSubmitPopoverGuardContext.Provider>;
}

function useOpenReportSubmitToPopover(): OpenReportSubmitToPopover {
    return useContext(ReportSubmitToPopoverContext);
}

/** Opens the shared Search submit-to popover for a report (e.g. bulk actions outside a list row). */
function useOpenSearchReportSubmitToPopover() {
    const host = useContext(ReportSubmitToPopoverHostContext);

    return useCallback(
        (reportID: string | undefined, options?: ReportSubmitToPopoverOpenOptions) => {
            host?.openReportSubmitToPopover(reportID, options);
        },
        [host],
    );
}

type ReportSubmitToPopoverAnchorProps = {
    reportID: string | undefined;
    onSubmitSuccess?: () => void;
    children: React.ReactNode;
    anchorAlignment?: AnchorAlignment;
};

type ReportSubmitToPopoverHostProps = {
    children: React.ReactNode;
    anchorAlignment?: AnchorAlignment;
};

/**
 * Renders a single submit-to popover for Search. List rows register their button anchors here so we do not mount
 * a Modal inside each FlashList cell (iOS only showed the backdrop when the modal lived in a recycled row).
 */
function ReportSubmitToPopoverHost({children, anchorAlignment}: ReportSubmitToPopoverHostProps) {
    const anchorRegistryRef = useRef<Map<string, RefObject<View | null>>>(new Map());
    const [activeReportID, setActiveReportID] = useState<string | undefined>();
    const pendingOpenRef = useRef<{reportID: string; options?: ReportSubmitToPopoverOpenOptions} | null>(null);

    const registerAnchor = useCallback((reportID: string | undefined, anchorRef: RefObject<View | null>) => {
        if (!reportID) {
            return () => {};
        }

        anchorRegistryRef.current.set(reportID, anchorRef);
        return () => {
            anchorRegistryRef.current.delete(reportID);
        };
    }, []);

    const getAnchorRef = useCallback(() => {
        if (!activeReportID) {
            return null;
        }
        return anchorRegistryRef.current.get(activeReportID) ?? null;
    }, [activeReportID]);

    const {
        reportSubmitToPopover,
        openReportSubmitToPopover: openPopoverForActiveReport,
        isReportSubmitToPopoverVisible,
        consumeIgnoreNextSearchSubmitPress,
    } = useReportSubmitToPopover({
        reportID: activeReportID,
        anchorAlignment,
        getAnchorRef,
    });

    const searchSubmitPopoverGuard = useMemo(
        () => ({
            isReportSubmitToPopoverVisible,
            consumeIgnoreNextSearchSubmitPress,
        }),
        [isReportSubmitToPopoverVisible, consumeIgnoreNextSearchSubmitPress],
    );

    const openReportSubmitToPopoverForHost = useCallback(
        (reportID: string | undefined, options?: ReportSubmitToPopoverOpenOptions) => {
            if (!reportID) {
                return;
            }

            if (activeReportID === reportID) {
                openPopoverForActiveReport(options);
                return;
            }

            pendingOpenRef.current = {reportID, options};
            setActiveReportID(reportID);
        },
        [activeReportID, openPopoverForActiveReport],
    );

    useLayoutEffect(() => {
        const pending = pendingOpenRef.current;
        if (!activeReportID || !pending || pending.reportID !== activeReportID) {
            return;
        }

        pendingOpenRef.current = null;
        openPopoverForActiveReport(pending.options);
    }, [activeReportID, openPopoverForActiveReport]);

    const hostContextValue = useMemo(
        () => ({
            registerAnchor,
            openReportSubmitToPopover: openReportSubmitToPopoverForHost,
        }),
        [registerAnchor, openReportSubmitToPopoverForHost],
    );

    return (
        <SearchSubmitPopoverGuardProvider guard={searchSubmitPopoverGuard}>
            <ReportSubmitToPopoverHostContext.Provider value={hostContextValue}>
                {children}
                {reportSubmitToPopover}
            </ReportSubmitToPopoverHostContext.Provider>
        </SearchSubmitPopoverGuardProvider>
    );
}

/** Mounts modal + opens callback; descendants use {@link useOpenReportSubmitToPopover} and {@link ReportSubmitToPopoverMeasurableAnchor}. */
function ReportSubmitToPopoverRoot({reportID, onSubmitSuccess, anchorAlignment, children}: ReportSubmitToPopoverAnchorProps) {
    const host = useContext(ReportSubmitToPopoverHostContext);

    if (host) {
        return (
            <ReportSubmitToPopoverRootWithHost
                reportID={reportID}
                host={host}
            >
                {children}
            </ReportSubmitToPopoverRootWithHost>
        );
    }

    return (
        <ReportSubmitToPopoverRootWithLocalPopover
            reportID={reportID}
            onSubmitSuccess={onSubmitSuccess}
            anchorAlignment={anchorAlignment}
        >
            {children}
        </ReportSubmitToPopoverRootWithLocalPopover>
    );
}

function ReportSubmitToPopoverRootWithHost({reportID, host, children}: {reportID: string | undefined; host: ReportSubmitToPopoverHostContextValue; children: React.ReactNode}) {
    const anchorRef = useRef<View>(null);

    useEffect(() => host.registerAnchor(reportID, anchorRef), [host, reportID]);

    const openReportSubmitToPopover = useCallback(
        (options?: ReportSubmitToPopoverOpenOptions) => {
            host.openReportSubmitToPopover(reportID, options);
        },
        [host, reportID],
    );

    return (
        <ReportSubmitToPopoverAnchorRefContext.Provider value={anchorRef}>
            <ReportSubmitToPopoverContext.Provider value={openReportSubmitToPopover}>{children}</ReportSubmitToPopoverContext.Provider>
        </ReportSubmitToPopoverAnchorRefContext.Provider>
    );
}

function ReportSubmitToPopoverRootWithLocalPopover({reportID, onSubmitSuccess, anchorAlignment, children}: ReportSubmitToPopoverAnchorProps) {
    const {anchorRef, openReportSubmitToPopover, reportSubmitToPopover, isReportSubmitToPopoverVisible, consumeIgnoreNextSearchSubmitPress} = useReportSubmitToPopover({
        reportID,
        onSubmitSuccess,
        anchorAlignment,
    });

    const searchSubmitPopoverGuard = useMemo(
        () => ({
            isReportSubmitToPopoverVisible,
            consumeIgnoreNextSearchSubmitPress,
        }),
        [isReportSubmitToPopoverVisible, consumeIgnoreNextSearchSubmitPress],
    );

    return (
        <SearchSubmitPopoverGuardProvider guard={searchSubmitPopoverGuard}>
            <ReportSubmitToPopoverAnchorRefContext.Provider value={anchorRef}>
                <ReportSubmitToPopoverContext.Provider value={openReportSubmitToPopover}>{children}</ReportSubmitToPopoverContext.Provider>
                {reportSubmitToPopover}
            </ReportSubmitToPopoverAnchorRefContext.Provider>
        </SearchSubmitPopoverGuardProvider>
    );
}

/** Binds submit-to measurements to children only — use under {@link ReportSubmitToPopoverRoot}. */
function ReportSubmitToPopoverMeasurableAnchor({children}: {children: React.ReactNode}) {
    const anchorRef = useContext(ReportSubmitToPopoverAnchorRefContext);

    if (!anchorRef) {
        return children;
    }

    return (
        <View
            ref={anchorRef}
            collapsable={false}
        >
            {children}
        </View>
    );
}

/** Wraps submit controls; exposes {@link useOpenReportSubmitToPopover} to descendants and renders the shared submit-to popover. */
function ReportSubmitToPopoverAnchor({reportID, onSubmitSuccess, anchorAlignment, children}: ReportSubmitToPopoverAnchorProps) {
    return (
        <ReportSubmitToPopoverRoot
            reportID={reportID}
            onSubmitSuccess={onSubmitSuccess}
            anchorAlignment={anchorAlignment}
        >
            <ReportSubmitToPopoverMeasurableAnchor>{children}</ReportSubmitToPopoverMeasurableAnchor>
        </ReportSubmitToPopoverRoot>
    );
}

export {
    ReportSubmitToPopoverAnchor,
    ReportSubmitToPopoverHost,
    ReportSubmitToPopoverMeasurableAnchor,
    ReportSubmitToPopoverRoot,
    SEARCH_REPORT_SUBMIT_TO_POPOVER_ANCHOR_ALIGNMENT,
    useOpenReportSubmitToPopover,
    useOpenSearchReportSubmitToPopover,
    useSearchSubmitPopoverGuard,
};
