import {Item, RadioItem, ScrollableContent, Sub} from '@components/PopoverMenu/v2';
import {useVideoPopoverMenuActions, useVideoPopoverMenuState} from '@components/VideoPlayerContexts/VideoPopoverMenuContext';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';

import CONST from '@src/CONST';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import type {TupleToUnion} from 'type-fest';

import React from 'react';

function getPlaybackSpeedSentryLabel(speed: TupleToUnion<typeof CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS>): SentryLabel {
    switch (speed) {
        case 0.25:
            return CONST.SENTRY_LABEL.VIDEO_PLAYER.PLAYBACK_SPEED_OPTION.SPEED_025;
        case 0.5:
            return CONST.SENTRY_LABEL.VIDEO_PLAYER.PLAYBACK_SPEED_OPTION.SPEED_050;
        case 0.75:
            return CONST.SENTRY_LABEL.VIDEO_PLAYER.PLAYBACK_SPEED_OPTION.SPEED_075;
        case 1:
            return CONST.SENTRY_LABEL.VIDEO_PLAYER.PLAYBACK_SPEED_OPTION.SPEED_100;
        case 1.25:
            return CONST.SENTRY_LABEL.VIDEO_PLAYER.PLAYBACK_SPEED_OPTION.SPEED_125;
        case 1.5:
            return CONST.SENTRY_LABEL.VIDEO_PLAYER.PLAYBACK_SPEED_OPTION.SPEED_150;
        case 1.75:
            return CONST.SENTRY_LABEL.VIDEO_PLAYER.PLAYBACK_SPEED_OPTION.SPEED_175;
        case 2:
            return CONST.SENTRY_LABEL.VIDEO_PLAYER.PLAYBACK_SPEED_OPTION.SPEED_200;
        default: {
            // TypeScript flags this when a speed is added to `CONST.VIDEO_PLAYER.PLAYBACK_SPEEDS` without a label above.
            const exhaustiveCheck: never = speed;
            return exhaustiveCheck;
        }
    }
}

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
                            sentryLabel={getPlaybackSpeedSentryLabel(speed)}
                        />
                    ))}
                </Sub.Content>
            </Sub>
        </ScrollableContent>
    );
}

export default VideoPopoverMenu;
