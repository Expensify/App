import React from 'react';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {PressableWithFeedbackProps} from '@components/Pressable/PressableWithFeedback';
import Tooltip from '@components/Tooltip';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type IconAsset from '@src/types/utils/IconAsset';

type SubmitDraftButtonProps = PressableWithFeedbackProps & {
    /** The label to display on the button */
    label: string;

    /** The icon to display on the button */
    icon: IconAsset;

    /** Whether the button is disabled */
    isDisabled: boolean;

    /** Handle clicking on send button */
    onPress?: () => void;
};

function SubmitDraftButton({isDisabled: isDisabledProp = false, icon, label, sentryLabel, onPress, ...restProps}: SubmitDraftButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <Tooltip text={label}>
            <PressableWithFeedback
                style={({pressed, isDisabled}) => [
                    styles.chatItemSubmitButton,
                    isDisabledProp || pressed || isDisabled ? undefined : styles.buttonSuccess,
                    isDisabledProp ? styles.cursorDisabled : undefined,
                ]}
                onPress={onPress}
                sentryLabel={sentryLabel}
                disabled={isDisabledProp}
                {...restProps}
            >
                {({pressed}) => (
                    <Icon
                        src={icon}
                        fill={isDisabledProp || pressed ? theme.icon : theme.textLight}
                    />
                )}
            </PressableWithFeedback>
        </Tooltip>
    );
}

export default SubmitDraftButton;
