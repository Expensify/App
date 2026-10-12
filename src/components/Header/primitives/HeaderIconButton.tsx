import Icon from '@components/Icon';
import type {PressableRef} from '@components/Pressable/GenericPressable/types';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';

type HeaderTooltipIconButtonProps = {
    /** Tooltip text, also used as the accessibility label. */
    tooltipText: string;

    /** Method to trigger when pressing the button. */
    onPress?: (event?: GestureResponderEvent | KeyboardEvent) => void;

    /** Icon to display inside the button. */
    iconSrc: IconAsset;

    /** Optional fill color for the icon. Defaults to `theme.icon`. */
    iconFill?: string;

    /** Sentry label for this button. */
    sentryLabel?: string;

    /** Additional styles for the pressable, applied after the default `touchableButtonImage`. */
    style?: StyleProp<ViewStyle>;

    /** Native id, e.g. for the back button's platform-specific wiring. */
    id?: string;

    /** Ref forwarded to the underlying `PressableWithoutFeedback`. */
    ref?: PressableRef;
};

/** Shared shape for the header's icon buttons: Tooltip, Pressable and Icon. Callers own their own onPress wrapping, loading states and fill logic. This only renders the common skeleton. */
function HeaderIconButton({tooltipText, onPress, iconSrc, iconFill, sentryLabel, style, id, ref}: HeaderTooltipIconButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <Tooltip text={tooltipText}>
            <PressableWithoutFeedback
                ref={ref}
                onPress={onPress}
                style={[styles.touchableButtonImage, style]}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={tooltipText}
                id={id}
                sentryLabel={sentryLabel}
            >
                <Icon
                    src={iconSrc}
                    fill={iconFill ?? theme.icon}
                />
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

export default HeaderIconButton;
