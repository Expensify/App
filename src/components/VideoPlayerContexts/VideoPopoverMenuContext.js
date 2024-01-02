import PropTypes from 'prop-types';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import _ from 'underscore';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';

const VideoPopoverMenuContext = React.createContext(null);

function VideoPopoverMenuContextProvider({children}) {
    const {translate} = useLocalize();
    const [playbackSpeeds] = useState(CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS);
    const [currentPlaybackSpeed, setCurrentPlaybackSpeed] = useState(playbackSpeeds[2]);

    const updatePlaybackSpeed = useCallback((speed) => {
        setCurrentPlaybackSpeed(speed);
    }, []);

    const menuItems = useMemo(
        () => [
            {
                icon: Expensicons.Download,
                text: translate('common.download'),
                onSelected: () => {
                    // TODO: Implement download
                },
            },
            {
                icon: Expensicons.Meter,
                text: translate('videoPlayer.playbackSpeed'),
                subMenuItems: [
                    ..._.map(playbackSpeeds, (speed) => ({
                        icon: currentPlaybackSpeed === speed ? Expensicons.Checkmark : null,
                        text: speed.toString(),
                        onSelected: () => {
                            // updatePlaybackSpeed(speed);
                            console.log(`SPEED: ${speed}`);
                        },
                        shouldPutLeftPaddingWhenNoIcon: true,
                    })),
                ],
            },
        ],
        [currentPlaybackSpeed, playbackSpeeds, translate],
    );

    const contextValue = useMemo(() => ({menuItems, updatePlaybackSpeed}), [menuItems, updatePlaybackSpeed]);
    return <VideoPopoverMenuContext.Provider value={contextValue}>{children}</VideoPopoverMenuContext.Provider>;
}

function useVideoPopoverMenuContext() {
    const context = useContext(VideoPopoverMenuContext);
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
