import {Item, RadioItem, ScrollableContent, Sub} from '@components/PopoverMenu/v2';
import {useVideoPopoverMenuActions, useVideoPopoverMenuState} from '@components/VideoPlayerContexts/VideoPopoverMenuContext';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';

import CONST from '@src/CONST';

import React from 'react';

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
                    sentryLabel={CONST.SENTRY_LABEL.VIDEO_PLAYER.MORE_MENU_DOWNLOAD}
                />
            )}
            <Sub id="playbackSpeed">
                <Sub.Trigger
                    text={playbackSpeedLabel}
                    icon={icons.Meter}
                    sentryLabel={CONST.SENTRY_LABEL.VIDEO_PLAYER.MORE_MENU_PLAYBACK_SPEED}
                />
                <Sub.Content>
                    <Sub.BackButton text={playbackSpeedLabel} />
                    {CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS.map((speed) => (
                        <RadioItem
                            key={speed}
                            text={speed === 1 ? normalSpeedLabel : speed.toString()}
                            isSelected={currentPlaybackSpeed === speed}
                            onSelect={() => updatePlaybackSpeed(speed)}
                            sentryLabel={CONST.SENTRY_LABEL.VIDEO_PLAYER.PLAYBACK_SPEED_OPTION}
                        />
                    ))}
                </Sub.Content>
            </Sub>
        </ScrollableContent>
    );
}

export default VideoPopoverMenu;
