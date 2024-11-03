import type {ReactNode} from 'react';
import React, {createContext, useCallback, useMemo, useState} from 'react';

type ReportActionHighlightContextType = {
    linkedReportActionID: string | null;
    setHighlight: (id: string) => void;
    removeHighlight: () => void;
};

const ReportActionHighlightContext = createContext<ReportActionHighlightContextType>({
    linkedReportActionID: null,
    setHighlight: () => {},
    removeHighlight: () => {},
});

type ReportActionHighlightProviderProps = {
    children: ReactNode;
};

function ReportActionHighlightProvider({children}: ReportActionHighlightProviderProps) {
    const [linkedReportActionID, setLinkedReportActionID] = useState<string | null>(null);

    const setHighlight = useCallback((id: string) => {
        setLinkedReportActionID(id);
    }, []);

    const removeHighlight = useCallback(() => {
        setLinkedReportActionID(null);
    }, []);

    const value = useMemo(
        () => ({
            linkedReportActionID,
            setHighlight,
            removeHighlight,
        }),
        [linkedReportActionID, removeHighlight, setHighlight],
    );

    return <ReportActionHighlightContext.Provider value={value}>{children}</ReportActionHighlightContext.Provider>;
}

export default ReportActionHighlightProvider;
export {ReportActionHighlightContext};
