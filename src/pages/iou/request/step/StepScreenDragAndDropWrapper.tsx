import type {ReactNode} from 'react';
import React, {useState} from 'react';
import {View} from 'react-native';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import CONST from '@src/CONST';
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

    // TODO: remove beta check after the feature is enabled
    const {isBetaEnabled} = usePermissions();

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
            headerGapStyles={isDraggingOver ? [isBetaEnabled(CONST.BETAS.NEWDOT_MULTI_FILES_DRAG_AND_DROP) ? styles.dropWrapper : styles.isDraggingOver] : []}
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

StepScreenDragAndDropWrapper.displayName = 'StepScreenDragAndDropWrapper';

export default StepScreenDragAndDropWrapper;
