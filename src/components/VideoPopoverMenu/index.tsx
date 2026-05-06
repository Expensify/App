import React from 'react';
import * as PopoverMenu from '@components/PopoverMenu/v2';
import {useVideoPopoverMenuActions, useVideoPopoverMenuState} from '@components/VideoPlayerContexts/VideoPopoverMenuContext';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';

type VideoPopoverMenuProps = {
    isPopoverVisible?: boolean;

    /** Fires on item selection, outside click, and escape — not just one of those. */
    hidePopover?: () => void;

    anchorPosition?: AnchorPosition;
};

const DEFAULT_ANCHOR: AnchorPosition = {horizontal: 0, vertical: 0};

function VideoPopoverMenu({isPopoverVisible = false, hidePopover = () => {}, anchorPosition = DEFAULT_ANCHOR}: VideoPopoverMenuProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {currentPlaybackSpeed, isLocalFile} = useVideoPopoverMenuState();
    const {updatePlaybackSpeed, downloadAttachment} = useVideoPopoverMenuActions();
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark', 'Download', 'Meter']);

    const showDownload = !isOffline && !isLocalFile;
    const playbackSpeedLabel = translate('videoPlayer.playbackSpeed');

    return (
        <PopoverMenu.Root
            open={isPopoverVisible}
            onOpenChange={(open) => {
                if (open) {
                    return;
                }
                hidePopover();
            }}
        >
            <PopoverMenu.Content anchorPosition={anchorPosition}>
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
        </PopoverMenu.Root>
    );
}

export default VideoPopoverMenu;
