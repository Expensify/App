import React, {useRef} from 'react';
import type {View} from 'react-native';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';
import {useVideoPopoverMenuContext} from '@components/VideoPlayerContexts/VideoPopoverMenuContext';
import type {AnchorPosition} from '@styles/index';

type VideoPopoverMenuProps = {
    isPopoverVisible: boolean;
    hidePopover: (selectedItem?: PopoverMenuItem, index?: number) => void;
    anchorPosition: AnchorPosition;
};

function VideoPopoverMenu({
    isPopoverVisible = false,
    hidePopover = () => {},
    anchorPosition = {
        horizontal: 0,
        vertical: 0,
    },
}: VideoPopoverMenuProps) {
    const {menuItems} = useVideoPopoverMenuContext();
    const videoPlayerMenuRef = useRef<View | HTMLDivElement>(null);

    return (
        <PopoverMenu
            onClose={hidePopover}
            onItemSelected={hidePopover}
            isVisible={isPopoverVisible}
            anchorPosition={anchorPosition}
            menuItems={menuItems}
            anchorRef={videoPlayerMenuRef}
            withoutOverlay
        />
    );
}
VideoPopoverMenu.displayName = 'VideoPopoverMenu';

export default VideoPopoverMenu;
