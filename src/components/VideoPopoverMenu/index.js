import PropTypes from 'prop-types';
import React from 'react';
import PopoverMenu from '@components/PopoverMenu';
import {useVideoPopoverMenuContext} from '@components/VideoPlayerContexts/VideoPopoverMenuContext';

const propTypes = {
    isPopoverVisible: PropTypes.bool,

    hidePopover: PropTypes.func,

    anchorPosition: PropTypes.shape({
        horizontal: PropTypes.number.isRequired,
        vertical: PropTypes.number.isRequired,
    }),
};
const defaultProps = {
    isPopoverVisible: false,
    anchorPosition: {
        horizontal: 0,
        vertical: 0,
    },
    hidePopover: () => {},
};

function VideoPopoverMenu({isPopoverVisible, hidePopover, anchorPosition}) {
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

VideoPopoverMenu.propTypes = propTypes;
VideoPopoverMenu.defaultProps = defaultProps;
VideoPopoverMenu.displayName = 'VideoPopoverMenu';

export default VideoPopoverMenu;
