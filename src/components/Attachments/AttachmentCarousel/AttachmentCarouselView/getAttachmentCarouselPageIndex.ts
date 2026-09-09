const MIN_FLING_VELOCITY = 500;

type GetAttachmentCarouselPageIndexParams = {
    cellWidth: number;
    itemCount: number;
    page: number;
    translationX: number;
    velocityX: number;
};

function getAttachmentCarouselPageIndex({cellWidth, itemCount, page, translationX, velocityX}: GetAttachmentCarouselPageIndexParams): number {
    'worklet';

    if (velocityX > MIN_FLING_VELOCITY) {
        return Math.max(0, page - 1);
    }
    if (velocityX < -MIN_FLING_VELOCITY) {
        return Math.min(itemCount - 1, page + 1);
    }

    const pageDelta = Math.round(-translationX / cellWidth);
    return Math.min(itemCount - 1, Math.max(0, page + pageDelta));
}

export default getAttachmentCarouselPageIndex;
