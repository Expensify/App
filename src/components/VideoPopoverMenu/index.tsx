import React from 'react';
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

    return (
        <PopoverMenu
            onClose={hidePopover}
            onItemSelected={hidePopover}
            isVisible={isPopoverVisible}
            anchorPosition={anchorPosition}
            menuItems={menuItems}
            withoutOverlay
        />
    );
}
VideoPopoverMenu.displayName = 'VideoPopoverMenu';

export default VideoPopoverMenu;
