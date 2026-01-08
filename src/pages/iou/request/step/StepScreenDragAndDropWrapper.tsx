import type {ReactNode} from 'react';
import React, {useState} from 'react';
import {View} from 'react-native';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import callOrReturn from '@src/types/utils/callOrReturn';

type StepScreenDragAndDropWrapperProps = {
    /** The title to show in the header (should be translated already) */
    headerTitle: string;

    /** A function triggered when the back button is pressed */
    onBackButtonPress: () => void;

    /** A function triggered when the entry transition is ended. Useful for auto-focusing elements. */
    onEntryTransitionEnd?: () => void;

    /** Whether or not the wrapper should be shown (sometimes screens can be embedded inside another screen that already is using a wrapper) */
    shouldShowWrapper: boolean;

    /** An ID used for unit testing */
    testID: string;

    /** The children to render */
    children: ((isDraggingOver: boolean) => ReactNode) | ReactNode;
};

function StepScreenDragAndDropWrapper({testID, headerTitle, onBackButtonPress, onEntryTransitionEnd, children, shouldShowWrapper}: StepScreenDragAndDropWrapperProps) {
    const styles = useThemeStyles();

    const [isDraggingOver, setIsDraggingOver] = useState(false);

    if (!shouldShowWrapper) {
        return callOrReturn(children, false);
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            onEntryTransitionEnd={onEntryTransitionEnd}
            testID={testID}
            shouldEnableMaxHeight={canUseTouchScreen()}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <DragAndDropProvider setIsDraggingOver={setIsDraggingOver}>
                    <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                        <HeaderWithBackButton
                            title={headerTitle}
                            onBackButtonPress={onBackButtonPress}
                        />
                        {callOrReturn(children, isDraggingOver)}
                    </View>
                </DragAndDropProvider>
            )}
        </ScreenWrapper>
    );
}

export default StepScreenDragAndDropWrapper;
