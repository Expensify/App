import PropTypes from 'prop-types';
import React from 'react';
import PopoverMenu from '@components/PopoverMenu';
import {useVideoPopoverMenuContext} from '@components/VideoPlayerContexts/VideoPopoverMenuContext';
import useWindowDimensions from '@hooks/useWindowDimensions';

const propTypes = {
    isPopoverVisible: PropTypes.bool.isRequired,

    hidePopover: PropTypes.func.isRequired,

    anchorPosition: PropTypes.shape({
        horizontal: PropTypes.number.isRequired,
        vertical: PropTypes.number.isRequired,
    }),
};
const defaultProps = {
    anchorPosition: {
        horizontal: 0,
        vertical: 0,
    },
};

function VideoPopoverMenu({isPopoverVisible, hidePopover, anchorPosition}) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const {menuItems} = useVideoPopoverMenuContext();

    return (
        <PopoverMenu
            onClose={hidePopover}
            onItemSelected={hidePopover}
            isVisible={isPopoverVisible}
            anchorPosition={anchorPosition}
            fromSidebarMediumScreen={!isSmallScreenWidth}
            menuItems={menuItems}
            withoutOverlay
        />
    );
}

VideoPopoverMenu.propTypes = propTypes;
VideoPopoverMenu.defaultProps = defaultProps;
VideoPopoverMenu.displayName = 'VideoPopoverMenu';

export default VideoPopoverMenu;
