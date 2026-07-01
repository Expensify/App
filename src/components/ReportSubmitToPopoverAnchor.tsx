import type {RefObject} from 'react';
import React, {createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
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
    openReportSubmitToPopover: (reportID: string | undefined, options?: ReportSubmitToPopoverOpenOptions, anchorRef?: RefObject<View | null>) => void;
};

const ReportSubmitToPopoverHostContext = createContext<ReportSubmitToPopoverHostContextValue | null>(null);

type SearchSubmitPopoverGuardContextValue = {
    isReportSubmitToPopoverVisible: boolean;
    isReportSubmitToDismissGuardActive: boolean;
    shouldDisableSearchSubmitPress: boolean;
    consumeIgnoreNextSearchSubmitPress: () => boolean;
};

const defaultSearchSubmitPopoverGuard: SearchSubmitPopoverGuardContextValue = {
    isReportSubmitToPopoverVisible: false,
    isReportSubmitToDismissGuardActive: false,
    shouldDisableSearchSubmitPress: false,
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

type ReportSubmitToPopoverRootProps = {
    reportID: string | undefined;
    onSubmitSuccess?: () => void;
    children: React.ReactNode;
    anchorAlignment?: AnchorAlignment;
};

type ReportSubmitToPopoverAnchorProps = ReportSubmitToPopoverRootProps & {
    wrapperStyle?: StyleProp<ViewStyle>;
};

type ReportSubmitToPopoverHostProps = {
    children: React.ReactNode;
    anchorAlignment?: AnchorAlignment;
};

type ReportSubmitToPopoverMeasurableAnchorProps = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

/**
 * Renders a single submit-to popover for Search. List rows register their button anchors here so we do not mount
 * a Modal inside each FlashList cell (iOS only showed the backdrop when the modal lived in a recycled row).
 */
function ReportSubmitToPopoverHost({children, anchorAlignment}: ReportSubmitToPopoverHostProps) {
    const anchorRegistryRef = useRef<Map<string, Set<RefObject<View | null>>>>(new Map());
    const activeAnchorRefRef = useRef<RefObject<View | null> | null>(null);
    const [activeReportID, setActiveReportID] = useState<string | undefined>();
    const pendingOpenRef = useRef<{reportID: string; options?: ReportSubmitToPopoverOpenOptions; anchorRef?: RefObject<View | null>} | null>(null);

    const registerAnchor = useCallback((reportID: string | undefined, anchorRef: RefObject<View | null>) => {
        if (!reportID) {
            return () => {};
        }

        let anchors = anchorRegistryRef.current.get(reportID);
        if (!anchors) {
            anchors = new Set();
            anchorRegistryRef.current.set(reportID, anchors);
        }
        anchors.add(anchorRef);

        return () => {
            const registeredAnchors = anchorRegistryRef.current.get(reportID);
            if (!registeredAnchors) {
                return;
            }

            registeredAnchors.delete(anchorRef);
            if (registeredAnchors.size === 0) {
                anchorRegistryRef.current.delete(reportID);
            }
        };
    }, []);

    const getAnchorRef = useCallback(() => {
        if (activeAnchorRefRef.current) {
            return activeAnchorRefRef.current;
        }

        if (!activeReportID) {
            return null;
        }

        const anchors = anchorRegistryRef.current.get(activeReportID);
        if (!anchors?.size) {
            return null;
        }

        return anchors.values().next().value ?? null;
    }, [activeReportID]);

    const {
        reportSubmitToPopover,
        openReportSubmitToPopover: openPopoverForActiveReport,
        isReportSubmitToPopoverVisible,
        isReportSubmitToDismissGuardActive,
        consumeIgnoreNextSearchSubmitPress,
    } = useReportSubmitToPopover({
        reportID: activeReportID,
        anchorAlignment,
        getAnchorRef,
    });

    const searchSubmitPopoverGuard = useMemo(
        () => ({
            isReportSubmitToPopoverVisible,
            isReportSubmitToDismissGuardActive,
            shouldDisableSearchSubmitPress: isReportSubmitToPopoverVisible || isReportSubmitToDismissGuardActive,
            consumeIgnoreNextSearchSubmitPress,
        }),
        [isReportSubmitToPopoverVisible, isReportSubmitToDismissGuardActive, consumeIgnoreNextSearchSubmitPress],
    );

    const openReportSubmitToPopoverForHost = useCallback(
        (reportID: string | undefined, options?: ReportSubmitToPopoverOpenOptions, anchorRef?: RefObject<View | null>) => {
            if (!reportID) {
                return;
            }

            activeAnchorRefRef.current = anchorRef ?? null;

            if (activeReportID === reportID) {
                openPopoverForActiveReport(options);
                return;
            }

            pendingOpenRef.current = {reportID, options, anchorRef};
            setActiveReportID(reportID);
        },
        [activeReportID, openPopoverForActiveReport],
    );

    useLayoutEffect(() => {
        const pending = pendingOpenRef.current;
        if (!activeReportID || !pending || pending.reportID !== activeReportID) {
            return;
        }

        activeAnchorRefRef.current = pending.anchorRef ?? null;
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
function ReportSubmitToPopoverRoot({reportID, onSubmitSuccess, anchorAlignment, children}: ReportSubmitToPopoverRootProps) {
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
            host.openReportSubmitToPopover(reportID, options, anchorRef);
        },
        [host, reportID, anchorRef],
    );

    return (
        <ReportSubmitToPopoverAnchorRefContext.Provider value={anchorRef}>
            <ReportSubmitToPopoverContext.Provider value={openReportSubmitToPopover}>{children}</ReportSubmitToPopoverContext.Provider>
        </ReportSubmitToPopoverAnchorRefContext.Provider>
    );
}

function ReportSubmitToPopoverRootWithLocalPopover({reportID, onSubmitSuccess, anchorAlignment, children}: ReportSubmitToPopoverRootProps) {
    const {anchorRef, openReportSubmitToPopover, reportSubmitToPopover, isReportSubmitToPopoverVisible, isReportSubmitToDismissGuardActive, consumeIgnoreNextSearchSubmitPress} =
        useReportSubmitToPopover({
            reportID,
            onSubmitSuccess,
            anchorAlignment,
        });

    const searchSubmitPopoverGuard = useMemo(
        () => ({
            isReportSubmitToPopoverVisible,
            isReportSubmitToDismissGuardActive,
            shouldDisableSearchSubmitPress: isReportSubmitToPopoverVisible || isReportSubmitToDismissGuardActive,
            consumeIgnoreNextSearchSubmitPress,
        }),
        [isReportSubmitToPopoverVisible, isReportSubmitToDismissGuardActive, consumeIgnoreNextSearchSubmitPress],
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
function ReportSubmitToPopoverMeasurableAnchor({children, style}: ReportSubmitToPopoverMeasurableAnchorProps) {
    const anchorRef = useContext(ReportSubmitToPopoverAnchorRefContext);

    if (!anchorRef) {
        return children;
    }

    return (
        <View
            ref={anchorRef}
            collapsable={false}
            style={style}
        >
            {children}
        </View>
    );
}

/** Wraps submit controls; exposes {@link useOpenReportSubmitToPopover} to descendants and renders the shared submit-to popover. */
function ReportSubmitToPopoverAnchor({reportID, onSubmitSuccess, anchorAlignment, wrapperStyle, children}: ReportSubmitToPopoverAnchorProps) {
    return (
        <ReportSubmitToPopoverRoot
            reportID={reportID}
            onSubmitSuccess={onSubmitSuccess}
            anchorAlignment={anchorAlignment}
        >
            <ReportSubmitToPopoverMeasurableAnchor style={wrapperStyle}>{children}</ReportSubmitToPopoverMeasurableAnchor>
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
