import type {RefObject} from 'react';
import React, {createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import useReportSubmitToPopover from '@hooks/useReportSubmitToPopover';
import type {ReportSubmitToPopoverOpenOptions} from '@hooks/useReportSubmitToPopover';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

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

function useOpenReportSubmitToPopover(): OpenReportSubmitToPopover {
    return useContext(ReportSubmitToPopoverContext);
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

    const {reportSubmitToPopover, openReportSubmitToPopover: openPopoverForActiveReport} = useReportSubmitToPopover({
        reportID: activeReportID,
        anchorAlignment,
        getAnchorRef,
    });

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
        <ReportSubmitToPopoverHostContext.Provider value={hostContextValue}>
            {children}
            {reportSubmitToPopover}
        </ReportSubmitToPopoverHostContext.Provider>
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
    const {anchorRef, openReportSubmitToPopover, reportSubmitToPopover} = useReportSubmitToPopover({reportID, onSubmitSuccess, anchorAlignment});

    return (
        <ReportSubmitToPopoverAnchorRefContext.Provider value={anchorRef}>
            <ReportSubmitToPopoverContext.Provider value={openReportSubmitToPopover}>{children}</ReportSubmitToPopoverContext.Provider>
            {reportSubmitToPopover}
        </ReportSubmitToPopoverAnchorRefContext.Provider>
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

export {ReportSubmitToPopoverAnchor, ReportSubmitToPopoverHost, ReportSubmitToPopoverMeasurableAnchor, ReportSubmitToPopoverRoot, useOpenReportSubmitToPopover};
