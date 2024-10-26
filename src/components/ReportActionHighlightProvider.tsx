import type {ReactNode} from 'react';
import React, {createContext, useCallback, useMemo, useState} from 'react';

// Define the context type
type ReportActionHighlightContextType = {
    linkedReportActionID: string | null;
    setHighlight: (id: string) => void;
    removeHighlight: () => void;
};

// Create the context with a default value
const ReportActionHighlightContext = createContext<ReportActionHighlightContextType>({
    linkedReportActionID: null,
    setHighlight: () => {},
    removeHighlight: () => {},
});

// Define props type for the provider
type ReportActionHighlightProviderProps = {
    children: ReactNode;
};

// Context provider component
function ReportActionHighlightProvider({children}: ReportActionHighlightProviderProps): JSX.Element {
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
