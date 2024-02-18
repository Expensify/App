import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {View} from 'react-native';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';

const propTypes = {
    /** The things to display inside the screenwrapper */
    children: PropTypes.node.isRequired,

    /** The title to show in the header (should be translated already) */
    headerTitle: PropTypes.string.isRequired,

    /** A function triggered when the back button is pressed */
    onBackButtonPress: PropTypes.func.isRequired,

    /** A function triggered when the entry transition is ended. Useful for auto-focusing elements. */
    onEntryTransitionEnd: PropTypes.func,

    /** Whether or not the wrapper should be shown (sometimes screens can be embedded inside another screen that already is using a wrapper) */
    shouldShowWrapper: PropTypes.bool.isRequired,

    /** An ID used for unit testing */
    testID: PropTypes.string.isRequired,
};

const defaultProps = {
    onEntryTransitionEnd: () => {},
};

function StepScreenDragAndDropWrapper({testID, headerTitle, onBackButtonPress, onEntryTransitionEnd, children, shouldShowWrapper}) {
    const styles = useThemeStyles();

    const [isDraggingOver, setIsDraggingOver] = useState(false);

    if (!shouldShowWrapper) {
        return children;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            onEntryTransitionEnd={onEntryTransitionEnd}
            testID={testID}
            shouldEnableMaxHeight={DeviceCapabilities.canUseTouchScreen()}
            headerGapStyles={isDraggingOver ? [styles.isDraggingOver] : []}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <DragAndDropProvider setIsDraggingOver={setIsDraggingOver}>
                    <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                        <HeaderWithBackButton
                            title={headerTitle}
                            onBackButtonPress={onBackButtonPress}
                        />
                        {children}
                    </View>
                </DragAndDropProvider>
            )}
        </ScreenWrapper>
    );
}

StepScreenDragAndDropWrapper.displayName = 'StepScreenDragAndDropWrapper';
StepScreenDragAndDropWrapper.propTypes = propTypes;
StepScreenDragAndDropWrapper.defaultProps = defaultProps;

export default StepScreenDragAndDropWrapper;
