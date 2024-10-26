import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import type {ReactNode} from 'react';
import React, {createContext, useCallback, useLayoutEffect, useMemo, useState} from 'react';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

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
function ReportActionHighlightProvider({children}: ReportActionHighlightProviderProps) {
    const route = useRoute<RouteProp<AuthScreensParamList, typeof SCREENS.REPORT>>();
    const reportActionID = route.params?.reportActionID;
    const [linkedReportActionID, setLinkedReportActionID] = useState<string | null>(reportActionID ?? null);

    useLayoutEffect(() => {
        setLinkedReportActionID(reportActionID ?? null);
    }, [reportActionID]);

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
