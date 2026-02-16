import React, {memo} from 'react';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';

type SendButtonProps = {
    /** Whether the button is disabled */
    isDisabled: boolean;

    /** Whether the button is in editing mode */
    isEditing?: boolean;

    /** Handle clicking on send button */
    onSend: () => void;
};

function SendButton({isDisabled: isDisabledProp, onSend, isEditing = false}: SendButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark']);

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to manage GestureDetector correctly
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const Tap = Gesture.Tap()
        .onEnd(() => {
            onSend();
        })
        .runOnJS(true)
        .withTestId(CONST.COMPOSER.SEND_BUTTON_TEST_ID);

    const label = isEditing ? translate('common.saveChanges') : translate('common.send');
    const sentryLabel = isEditing ? CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_ITEM_MESSAGE_EDIT_SAVE_BUTTON : CONST.SENTRY_LABEL.REPORT.SEND_BUTTON;

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
                    accessibilityLabel={label}
                    collapsable={false}
                >
                    <Tooltip text={label}>
                        <PressableWithFeedback
                            style={({pressed, isDisabled}) => [
                                styles.chatItemSubmitButton,
                                isDisabledProp || pressed || isDisabled ? undefined : styles.buttonSuccess,
                                isDisabledProp ? styles.cursorDisabled : undefined,
                            ]}
                            // Since the parent View has accessible, we need to set accessible to false here to avoid duplicate accessibility elements.
                            // On Android when TalkBack is enabled, only the parent element should be accessible, otherwise the button will not work.
                            accessible={false}
                            focusable={false}
                            sentryLabel={sentryLabel}
                        >
                            {({pressed}) => (
                                <Icon
                                    src={isEditing ? icons.Checkmark : Expensicons.Send}
                                    fill={isDisabledProp || pressed ? theme.icon : theme.textLight}
                                />
                            )}
                        </PressableWithFeedback>
                    </Tooltip>
                </View>
            </GestureDetector>
        </View>
    );
}

export default memo(SendButton);
