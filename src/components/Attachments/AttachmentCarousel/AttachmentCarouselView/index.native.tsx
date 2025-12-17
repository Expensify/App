import React, {useCallback, useRef, useState} from 'react';
import {Keyboard, View} from 'react-native';
import CarouselButtons from '@components/Attachments/AttachmentCarousel/CarouselButtons';
import AttachmentCarouselPager from '@components/Attachments/AttachmentCarousel/Pager';
import type {AttachmentCarouselPagerHandle} from '@components/Attachments/AttachmentCarousel/Pager';
import type {AttachmentSource} from '@components/Attachments/types';
import BlockingView from '@components/BlockingViews/BlockingView';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';
import variables from '@styles/variables';
import type AttachmentCarouselViewProps from './types';

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
    onSwipeDown,
    setPage,
    attachmentID,
}: AttachmentCarouselViewProps) {
    const {translate} = useLocalize();
    const canUseTouchScreen = canUseTouchScreenUtil();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['ToddBehindCloud']);
    const [activeAttachmentID, setActiveAttachmentID] = useState<AttachmentSource>(attachmentID ?? source);

    const pagerRef = useRef<AttachmentCarouselPagerHandle>(null);

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
                    icon={illustrations.ToddBehindCloud}
                    iconWidth={variables.modalTopIconWidth}
                    iconHeight={variables.modalTopIconHeight}
                    title={translate('notFound.notHere')}
                />
            ) : (
                <>
                    <CarouselButtons
                        page={page}
                        attachments={attachments}
                        shouldShowArrows={shouldShowArrows}
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
                        onSwipeDown={onSwipeDown}
                        ref={pagerRef}
                        reportID={report?.reportID}
                    />
                </>
            )}
        </View>
    );
}

export default AttachmentCarouselView;
