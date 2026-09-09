import getAttachmentCarouselPageIndex from '@components/Attachments/AttachmentCarousel/AttachmentCarouselView/getAttachmentCarouselPageIndex';

describe('getAttachmentCarouselPageIndex', () => {
    it('moves one page in the fling direction and clamps at the ends', () => {
        expect(getAttachmentCarouselPageIndex({cellWidth: 300, itemCount: 3, page: 1, translationX: 0, velocityX: -600})).toBe(2);
        expect(getAttachmentCarouselPageIndex({cellWidth: 300, itemCount: 3, page: 2, translationX: 0, velocityX: -600})).toBe(2);
        expect(getAttachmentCarouselPageIndex({cellWidth: 300, itemCount: 3, page: 0, translationX: 0, velocityX: 600})).toBe(0);
    });

    it('snaps to the nearest page for a slow drag', () => {
        expect(getAttachmentCarouselPageIndex({cellWidth: 300, itemCount: 4, page: 1, translationX: -170, velocityX: 100})).toBe(2);
        expect(getAttachmentCarouselPageIndex({cellWidth: 300, itemCount: 4, page: 1, translationX: 120, velocityX: 100})).toBe(1);
    });
});
