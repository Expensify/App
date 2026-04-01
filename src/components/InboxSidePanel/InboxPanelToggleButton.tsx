import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import Button from '@components/Button';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import {useInboxPanelActions, useInboxPanelState} from './InboxPanelContext';

type InboxPanelToggleButtonProps = {
    style?: StyleProp<ViewStyle>;
};

function InboxPanelToggleButton({style}: InboxPanelToggleButtonProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const {togglePanel} = useInboxPanelActions();
    const {isOpen} = useInboxPanelState();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubbles']);

    if (isOpen) {
        return null;
    }

    return (
        <Button
            icon={icons.ChatBubbles}
            iconFill={theme.icon}
            text={translate('common.chats')}
            onPress={togglePanel}
            accessibilityLabel={translate('common.chats')}
            style={style}
        />
    );
}

export default InboxPanelToggleButton;
