import React, {useCallback, useRef, useState} from 'react';
import {Keyboard, View} from 'react-native';
import CarouselButtons from '@components/Attachments/AttachmentCarousel/CarouselButtons';
import AttachmentCarouselPager from '@components/Attachments/AttachmentCarousel/Pager';
import type {AttachmentCarouselPagerHandle} from '@components/Attachments/AttachmentCarousel/Pager';
import type {Attachment, AttachmentSource} from '@components/Attachments/types';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';
import variables from '@styles/variables';
import type {Report} from '@src/types/onyx';

type AttachmentCarouselViewProps = {
    /** Where the arrows should be visible */
    shouldShowArrows: boolean;

    /** The current page index */
    page: number;

    /** The attachments from the carousel */
    attachments: Attachment[];

    attachmentID?: string;

    source: AttachmentSource;

    report?: Report;

    /** Callback for auto hiding carousel button arrows */
    autoHideArrows: () => void;

    setShouldShowArrows: (show?: React.SetStateAction<boolean>) => void;

    /** Callback for cancelling auto hiding of carousel button arrows */
    cancelAutoHideArrow: () => void;
    onAttachmentError?: (source: AttachmentSource, state?: boolean) => void;
    onNavigate?: (item: Attachment) => void;
    onClose: () => void;
    setPage: (page: number) => void;
};

function AttachmentCarouselView({
    page,
    attachments,
    shouldShowArrows,
    source,
    report,
    autoHideArrows,
    cancelAutoHideArrow,
    setShouldShowArrows,
    onAttachmentError,
    onNavigate,
    onClose,
    setPage,
    attachmentID,
}: AttachmentCarouselViewProps) {
    const {translate} = useLocalize();
    const canUseTouchScreen = canUseTouchScreenUtil();
    const styles = useThemeStyles();
    const [activeAttachmentID, setActiveAttachmentID] = useState<AttachmentSource>(attachmentID ?? source);

    const pagerRef = useRef<AttachmentCarouselPagerHandle>(null);

    const isBackDisabled = page === 0;
    const isForwardDisabled = page === attachments.length - 1;

    /** Updates the page state when the user navigates between attachments */
    const updatePage = useCallback(
        (newPageIndex: number) => {
            Keyboard.dismiss();
            setShouldShowArrows(true);

            const item = attachments.at(newPageIndex);

            setPage(newPageIndex);
            if (newPageIndex >= 0 && item) {
                setActiveAttachmentID(item.attachmentID ?? item.source);
                if (onNavigate) {
                    onNavigate(item);
                }
                onNavigate?.(item);
            }
        },
        [setShouldShowArrows, attachments, setPage, onNavigate],
    );

    /**
     * Increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
     */
    const cycleThroughAttachments = useCallback(
        (deltaSlide: number) => {
            if (page === undefined) {
                return;
            }
            const nextPageIndex = page + deltaSlide;
            updatePage(nextPageIndex);
            pagerRef.current?.setPage(nextPageIndex);

            autoHideArrows();
        },
        [autoHideArrows, page, updatePage],
    );

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
                        isBackDisabled={isBackDisabled}
                        isForwardDisabled={isForwardDisabled}
                        onBack={() => cycleThroughAttachments(-1)}
                        onForward={() => cycleThroughAttachments(1)}
                        autoHideArrow={autoHideArrows}
                        cancelAutoHideArrow={cancelAutoHideArrow}
                    />
                    <AttachmentCarouselPager
                        items={attachments}
                        initialPage={page}
                        onAttachmentError={onAttachmentError}
                        activeAttachmentID={activeAttachmentID}
                        setShouldShowArrows={setShouldShowArrows}
                        onPageSelected={({nativeEvent: {position: newPage}}) => updatePage(newPage)}
                        onClose={onClose}
                        ref={pagerRef}
                        reportID={report?.reportID}
                    />
                </>
            )}
        </View>
    );
}

AttachmentCarouselView.displayName = 'AttachmentCarouselView';

export default AttachmentCarouselView;
