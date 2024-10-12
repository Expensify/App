import type {ReactNode} from 'react';
import React, {createContext, useCallback, useMemo, useState} from 'react';
import type {ViewStyle} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';

// Define the context type
type ReportActionHighlightContextType = {
    linkedReportActionID: string | null;
    setHighlight: (id: string) => void;
    removeHighlight: () => void;
    highlightedBackgroundColorIfNeeded: ViewStyle;
};

// Create the context with a default value
const ReportActionHighlightContext = createContext<ReportActionHighlightContextType>({
    linkedReportActionID: null,
    setHighlight: () => {},
    removeHighlight: () => {},
    highlightedBackgroundColorIfNeeded: {},
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

    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const highlightedBackgroundColorIfNeeded = useMemo(() => {
        return linkedReportActionID ? StyleUtils.getBackgroundColorStyle(theme.messageHighlightBG) : {};
    }, [linkedReportActionID, StyleUtils, theme.messageHighlightBG]);

    const value = useMemo(
        () => ({
            linkedReportActionID,
            setHighlight,
            removeHighlight,
            highlightedBackgroundColorIfNeeded,
        }),
        [linkedReportActionID, removeHighlight, setHighlight, highlightedBackgroundColorIfNeeded],
    );

    return <ReportActionHighlightContext.Provider value={value}>{children}</ReportActionHighlightContext.Provider>;
}

export default ReportActionHighlightProvider;
export {ReportActionHighlightContext};
