import React from 'react';
import * as PopoverMenu from '@components/PopoverMenu/v2';
import {useVideoPopoverMenuActions, useVideoPopoverMenuState} from '@components/VideoPlayerContexts/VideoPopoverMenuContext';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import CONST from '@src/CONST';

/** Must be rendered inside a `<PopoverMenu.Root>`. */
function VideoPopoverMenu() {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {currentPlaybackSpeed, isLocalFile} = useVideoPopoverMenuState();
    const {updatePlaybackSpeed, downloadAttachment} = useVideoPopoverMenuActions();
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark', 'Download', 'Meter']);

    const showDownload = !isOffline && !isLocalFile;
    const playbackSpeedLabel = translate('videoPlayer.playbackSpeed');

    return (
        <PopoverMenu.Content>
            {showDownload && (
                <PopoverMenu.Item
                    text={translate('common.download')}
                    icon={icons.Download}
                    onSelect={downloadAttachment}
                />
            )}
            <PopoverMenu.Sub>
                <PopoverMenu.Sub.Trigger
                    text={playbackSpeedLabel}
                    icon={icons.Meter}
                />
                <PopoverMenu.Sub.Content backButtonText={playbackSpeedLabel}>
                    {CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS.map((speed) => (
                        <PopoverMenu.CheckmarkItem
                            key={speed}
                            text={speed === 1 ? translate('videoPlayer.normal') : speed.toString()}
                            isSelected={currentPlaybackSpeed === speed}
                            shouldPutLeftPaddingWhenNoIcon
                            onSelect={() => updatePlaybackSpeed(speed)}
                        />
                    ))}
                </PopoverMenu.Sub.Content>
            </PopoverMenu.Sub>
        </PopoverMenu.Content>
    );
}

export default VideoPopoverMenu;
