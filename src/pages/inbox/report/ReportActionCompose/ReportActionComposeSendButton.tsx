import React, {memo} from 'react';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import SendOrSaveButton from './SendOrSaveButton';

type SendButtonProps = {
    /** Whether the button is disabled */
    isDisabled: boolean;

    /** Whether the button is in editing mode */
    isEditing?: boolean;

    /** Handle clicking on send button */
    onSend: () => void;
};

function ReportActionComposeSendButton({isDisabled: isDisabledProp = false, isEditing = false, onSend}: SendButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to manage GestureDetector correctly
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const Tap = Gesture.Tap()
        .enabled(!isDisabledProp)
        .onEnd(() => {
            onSend();
        })
        .runOnJS(true);

    const accessibilityLabel = translate(isEditing ? 'common.saveChanges' : 'common.send');

    return (
        <View
            style={styles.justifyContentEnd}
            // Keep focus on the composer when Send message is clicked.
            onMouseDown={(e) => e.preventDefault()}
        >
            <GestureDetector
                // A new GestureDetector instance must be created when switching from a large screen to a small screen
                // if not, the GestureDetector may not function correctly.
                key={`send-button-${isSmallScreenWidth ? 'small-screen' : 'normal-screen'}`}
                gesture={Tap}
            >
                <View
                    // In order to make buttons accessible, we have to wrap children in a View with accessible and accessibilityRole="button" props based on the docs: https://docs.swmansion.com/react-native-gesture-handler/docs/components/buttons/
                    accessible
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={accessibilityLabel}
                    collapsable={false}
                >
                    <SendOrSaveButton
                        isDisabled={isDisabledProp}
                        isEditing={isEditing}
                        accessible={false}
                        focusable={false}
                    />
                </View>
            </GestureDetector>
        </View>
    );
}

export default memo(ReportActionComposeSendButton);
