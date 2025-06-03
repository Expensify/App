import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import CarouselButtons from '@components/Attachments/AttachmentCarousel/CarouselButtons';
import type {Attachment} from '@components/Attachments/types';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';
import variables from '@styles/variables';

type AttachmentCarouselViewProps = {
    /** Where the arrows should be visible */
    shouldShowArrows: boolean;

    /** The current page index */
    page: number;

    /** The attachments from the carousel */
    attachments: Attachment[];

    /** Callback for auto hiding carousel button arrows */
    autoHideArrows: () => void;

    setShouldShowArrows: (shouldShow: boolean) => void;

    /** Callback for cancelling auto hiding of carousel button arrows */
    cancelAutoHideArrow: () => void;

    /** Callback to cycle through attachments */
    cycleThroughAttachments: (deltaSlide: number) => void;

    /** children components */
    children: ReactNode;
};

function AttachmentCarouselView({
    children,
    page,
    attachments,
    shouldShowArrows,
    autoHideArrows,
    cancelAutoHideArrow,
    setShouldShowArrows,
    cycleThroughAttachments,
}: AttachmentCarouselViewProps) {
    const {translate} = useLocalize();
    const canUseTouchScreen = canUseTouchScreenUtil();
    const styles = useThemeStyles();

    return (
        <View
            style={[styles.flex1, styles.attachmentCarouselContainer]}
            onMouseEnter={() => !canUseTouchScreen && setShouldShowArrows(true)}
            onMouseLeave={() => !canUseTouchScreen && setShouldShowArrows(false)}
        >
            {page === -1 ? (
                <BlockingView
                    icon={Illustrations.ToddBehindCloud}
                    iconWidth={variables.modalTopIconWidth}
                    iconHeight={variables.modalTopIconHeight}
                    title={translate('notFound.notHere')}
                />
            ) : (
                <>
                    <CarouselButtons
                        shouldShowArrows={shouldShowArrows}
                        page={page}
                        attachments={attachments}
                        onBack={() => cycleThroughAttachments(-1)}
                        onForward={() => cycleThroughAttachments(1)}
                        autoHideArrow={autoHideArrows}
                        cancelAutoHideArrow={cancelAutoHideArrow}
                    />
                    {children}
                </>
            )}
        </View>
    );
}

AttachmentCarouselView.displayName = 'AttachmentCarouselView';

export default AttachmentCarouselView;
