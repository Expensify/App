import React from 'react';
import type {ViewProps} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type MessageEditCancelButtonProps = ViewProps & {
    onCancel: () => void;
};

function MessageEditCancelButton({onCancel, ...restProps}: MessageEditCancelButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Close']);

    const closeButtonStyles = [styles.composerSizeButton, {marginVertical: styles.composerSizeButton.marginHorizontal}];

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <View {...restProps}>
            <Tooltip text={translate('common.cancel')}>
                <PressableWithFeedback
                    onPress={onCancel}
                    style={closeButtonStyles}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('common.close')}
                    // disable dimming
                    hoverDimmingValue={1}
                    pressDimmingValue={1}
                    // Keep focus on the composer when cancel button is clicked.
                    onMouseDown={(e) => e.preventDefault()}
                    sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_ITEM_MESSAGE_EDIT_CANCEL_BUTTON}
                >
                    <Icon
                        fill={theme.icon}
                        src={icons.Close}
                    />
                </PressableWithFeedback>
            </Tooltip>
        </View>
    );
}

export default MessageEditCancelButton;
