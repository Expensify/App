import React from 'react';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {PressableWithFeedbackProps} from '@components/Pressable/PressableWithFeedback';
import Tooltip from '@components/Tooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SendOrSaveButtonProps = PressableWithFeedbackProps & {
    /** Whether the button is disabled */
    isDisabled: boolean;

    /** Whether the button is in editing mode */
    isEditing?: boolean;

    /** Handle clicking on send button */
    onSendOrSave?: () => void;
};

function SendOrSaveButton({isDisabled: isDisabledProp = false, isEditing = false, onSendOrSave, ...restProps}: SendOrSaveButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Send', 'Checkmark']);
    const label = translate(isEditing ? 'common.saveChanges' : 'common.send');
    const sentryLabel = isEditing ? CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_ITEM_MESSAGE_EDIT_SAVE_BUTTON : CONST.SENTRY_LABEL.REPORT.SEND_BUTTON;

    return (
        <Tooltip text={label}>
            <PressableWithFeedback
                style={({pressed, isDisabled}) => [
                    styles.chatItemSubmitButton,
                    isDisabledProp || pressed || isDisabled ? undefined : styles.buttonSuccess,
                    isDisabledProp ? styles.cursorDisabled : undefined,
                ]}
                // Since the parent View has accessible, we need to set accessible to false here to avoid duplicate accessibility elements.
                // On Android when TalkBack is enabled, only the parent element should be accessible, otherwise the button will not work.
                onPress={onSendOrSave}
                sentryLabel={sentryLabel}
                disabled={isDisabledProp}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...restProps}
            >
                {({pressed}) => (
                    <Icon
                        src={isEditing ? icons.Checkmark : icons.Send}
                        fill={isDisabledProp || pressed ? theme.icon : theme.textLight}
                    />
                )}
            </PressableWithFeedback>
        </Tooltip>
    );
}

export default SendOrSaveButton;
