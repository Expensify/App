import {useIsFocused} from '@react-navigation/native';
import React, {memo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import getButtonState from '@libs/getButtonState';

type ConciergeAIButtonProps = {
    /** A callback function when the button is pressed */
    onPress?: (event?: GestureResponderEvent | KeyboardEvent) => void;
};

function ConciergeAIButton({onPress}: ConciergeAIButtonProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const isFocused = useIsFocused();

    return (
        <Tooltip text={translate('reportActionCompose.conciergeAI')}>
            <PressableWithoutFeedback
                style={({hovered, pressed}) => [styles.chatItemConciergeAIButton, StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed))]}
                onPress={(e) => {
                    if (!isFocused) {
                        return;
                    }

                    onPress?.(e);
                }}
                accessibilityLabel={translate('reportActionCompose.conciergeAI')}
            >
                {({hovered, pressed}) => (
                    <Icon
                        src={Expensicons.Concierge}
                        fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed))}
                    />
                )}
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

ConciergeAIButton.displayName = 'ConciergeAIButton';

export default memo(ConciergeAIButton);
