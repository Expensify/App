import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import Button from '@components/Button';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {useSidebarOrderedReportsState} from '@hooks/useSidebarOrderedReports';
import useTheme from '@hooks/useTheme';
import CONST from '@src/CONST';
import {useInboxPanelActions, useInboxPanelState} from './InboxPanelContext';

type InboxPanelToggleButtonProps = {
    style?: StyleProp<ViewStyle>;
};

function InboxPanelToggleButton({style}: InboxPanelToggleButtonProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const {togglePanel} = useInboxPanelActions();
    const {isOpen} = useInboxPanelState();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubbles', 'DotIndicator']);
    const {chatTabBrickRoad} = useSidebarOrderedReportsState();

    if (isOpen) {
        return null;
    }

    let icon = icons.ChatBubbles;
    let iconFill = theme.icon;

    if (chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR) {
        icon = icons.DotIndicator;
        iconFill = theme.danger;
    } else if (chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO) {
        icon = icons.DotIndicator;
        iconFill = theme.success;
    }

    return (
        <Button
            icon={icon}
            iconFill={iconFill}
            text={translate('common.chats')}
            onPress={togglePanel}
            accessibilityLabel={translate('common.chats')}
            style={style}
        />
    );
}

export default InboxPanelToggleButton;
