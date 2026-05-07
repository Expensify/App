import React from 'react';
import {CheckmarkItem, Item, ScrollableContent, Sub} from '@components/PopoverMenu/v2';
import {useVideoPopoverMenuActions, useVideoPopoverMenuState} from '@components/VideoPlayerContexts/VideoPopoverMenuContext';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import CONST from '@src/CONST';

/** Must be rendered inside a `<Root>` from `@components/PopoverMenu/v2`. */
function VideoPopoverMenu() {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {currentPlaybackSpeed, isLocalFile} = useVideoPopoverMenuState();
    const {updatePlaybackSpeed, downloadAttachment} = useVideoPopoverMenuActions();
    const icons = useMemoizedLazyExpensifyIcons(['Download', 'Meter']);

    const showDownload = !isOffline && !isLocalFile;
    const playbackSpeedLabel = translate('videoPlayer.playbackSpeed');
    const normalSpeedLabel = translate('videoPlayer.normal');

    return (
        <ScrollableContent>
            {showDownload && (
                <Item
                    text={translate('common.download')}
                    icon={icons.Download}
                    onSelect={downloadAttachment}
                />
            )}
            <Sub>
                <Sub.Trigger
                    text={playbackSpeedLabel}
                    icon={icons.Meter}
                />
                <Sub.Content backButtonText={playbackSpeedLabel}>
                    {CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS.map((speed) => (
                        <CheckmarkItem
                            key={speed}
                            text={speed === 1 ? normalSpeedLabel : speed.toString()}
                            isSelected={currentPlaybackSpeed === speed}
                            shouldPutLeftPaddingWhenNoIcon
                            onSelect={() => updatePlaybackSpeed(speed)}
                        />
                    ))}
                </Sub.Content>
            </Sub>
        </ScrollableContent>
    );
}

export default VideoPopoverMenu;
