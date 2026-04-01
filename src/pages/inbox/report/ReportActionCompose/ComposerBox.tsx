import React, {createContext, useContext, useRef} from 'react';
import type {MeasureInWindowOnSuccessCallback} from 'react-native';
import {View} from 'react-native';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getReportOfflinePendingActionAndErrors} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {useComposerData, useComposerSendState, useComposerState} from './ComposerContext';

type ComposerBoxContextValue = {
    measureContainer: (callback: MeasureInWindowOnSuccessCallback) => void;
};

const ComposerBoxContext = createContext<ComposerBoxContextValue>({
    measureContainer: () => {},
});

function useComposerBox() {
    return useContext(ComposerBoxContext);
}

type ComposerBoxProps = {
    reportID: string;
    children: React.ReactNode;
};

function ComposerBox({reportID, children}: ComposerBoxProps) {
    const styles = useThemeStyles();
    const {isFocused, isComposerFullSize} = useComposerState();
    const {exceededMaxLength, isBlockedFromConcierge} = useComposerSendState();
    const {PDFValidationComponent, ErrorModal} = useComposerData();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

    const {reportPendingAction: pendingAction} = getReportOfflinePendingActionAndErrors(report);
    const shouldUseFocusedColor = !isBlockedFromConcierge && isFocused;

    const containerRef = useRef<View>(null);
    const measureContainer = (callback: MeasureInWindowOnSuccessCallback) => {
        if (!containerRef.current) {
            return;
        }
        containerRef.current.measureInWindow(callback);
    };

    const contextValue = {measureContainer};

    return (
        <ComposerBoxContext.Provider value={contextValue}>
            <OfflineWithFeedback
                shouldDisableOpacity
                pendingAction={pendingAction}
                style={isComposerFullSize ? styles.chatItemFullComposeRow : {}}
                contentContainerStyle={isComposerFullSize ? styles.flex1 : {}}
            >
                <View
                    ref={containerRef}
                    style={[
                        shouldUseFocusedColor ? styles.chatItemComposeBoxFocusedColor : styles.chatItemComposeBoxColor,
                        styles.flexRow,
                        styles.chatItemComposeBox,
                        isComposerFullSize && styles.chatItemFullComposeBox,
                        !!exceededMaxLength && styles.borderColorDanger,
                    ]}
                >
                    {PDFValidationComponent}
                    {children}
                </View>
                {ErrorModal}
            </OfflineWithFeedback>
        </ComposerBoxContext.Provider>
    );
}

export default ComposerBox;
export {useComposerBox};
export type {ComposerBoxProps};
