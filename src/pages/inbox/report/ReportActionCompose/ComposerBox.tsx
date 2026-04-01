import React, {createContext, useContext, useEffect, useRef} from 'react';
import type {MeasureInWindowOnSuccessCallback} from 'react-native';
import {View} from 'react-native';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useThemeStyles from '@hooks/useThemeStyles';
import {hideEmojiPicker, isActive as isActiveEmojiPickerAction} from '@userActions/EmojiPickerAction';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
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
    isComposerFullSize: boolean;
    pendingAction: PendingAction | undefined;
    children: React.ReactNode;
};

function ComposerBox({reportID, isComposerFullSize, pendingAction, children}: ComposerBoxProps) {
    const styles = useThemeStyles();
    const {isFocused} = useComposerState();
    const {exceededMaxLength, isBlockedFromConcierge} = useComposerSendState();
    const {PDFValidationComponent, ErrorModal} = useComposerData();

    const shouldUseFocusedColor = !isBlockedFromConcierge && isFocused;

    const containerRef = useRef<View>(null);
    const measureContainer = (callback: MeasureInWindowOnSuccessCallback) => {
        if (!containerRef.current) {
            return;
        }
        containerRef.current.measureInWindow(callback);
    };

    // Hide emoji picker on unmount or when switching reports
    useEffect(
        () => () => {
            if (!isActiveEmojiPickerAction(reportID)) {
                return;
            }
            hideEmojiPicker();
        },
        [reportID],
    );

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
