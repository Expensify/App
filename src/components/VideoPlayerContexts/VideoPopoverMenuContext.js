import React, {useCallback, useMemo} from 'react';
import PropTypes from 'prop-types';

const VideoPopoverMenuContext = React.createContext(null);

function VideoPopoverMenuContextProvider({children}) {
    const [isPopoverVisible, setIsPopoverVisible] = React.useState(false);
    const [anchorPosition, setAnchorPosition] = React.useState({vertical: 0, horizontal: 0});

    const updateAnchorPosition = useCallback((y, x) => {
        setAnchorPosition({vertical: y, horizontal: x});
    }, []);

    const hidePopover = useCallback(() => {
        setIsPopoverVisible(false);
    }, []);

    const showPopover = useCallback(
        (y = 0, x = 0) => {
            setIsPopoverVisible(true);
            updateAnchorPosition(y, x);
        },
        [updateAnchorPosition],
    );

    const contextValue = useMemo(
        () => ({isPopoverVisible, hidePopover, showPopover, anchorPosition, updateAnchorPosition}),
        [anchorPosition, hidePopover, isPopoverVisible, showPopover, updateAnchorPosition],
    );
    return <VideoPopoverMenuContext.Provider value={contextValue}>{children}</VideoPopoverMenuContext.Provider>;
}

function useVideoPopoverMenuContext() {
    const context = React.useContext(VideoPopoverMenuContext);
    if (context === undefined) {
        throw new Error('useVideoPopoverMenuContext must be used within a PlaybackContextProvider');
    }
    return context;
}

VideoPopoverMenuContextProvider.displayName = 'VideoPopoverMenuContextProvider';
VideoPopoverMenuContextProvider.propTypes = {
    /** Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

export {VideoPopoverMenuContextProvider, useVideoPopoverMenuContext};
