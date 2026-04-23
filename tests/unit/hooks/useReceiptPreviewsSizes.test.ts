/* eslint-disable @typescript-eslint/naming-convention -- Mock module paths use non-standard naming conventions required by jest.mock */
import {renderHook} from '@testing-library/react-native';
import useReceiptPreviewsSizes from '@pages/iou/request/step/IOURequestStepScan/hooks/useReceiptPreviewsSizes';

const MOCK_STYLES = {
    receiptPlaceholder: {width: 44, marginRight: 8, height: 52},
    receiptPlaceholderLandscape: {height: 52, marginBottom: 8, width: 44},
    singleAvatarMedium: {height: 52, width: 52},
    ph4: {paddingHorizontal: 16},
    ph6: {paddingHorizontal: 24},
    pv2: {paddingVertical: 8},
    pb4: {paddingBottom: 16},
};

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: jest.fn(() => MOCK_STYLES),
}));

const mockUseWindowDimensions = jest.fn(() => ({windowWidth: 400, windowHeight: 800}));

jest.mock('@hooks/useWindowDimensions', () => ({
    __esModule: true,
    default: () => mockUseWindowDimensions(),
}));

describe('useReceiptPreviewsSizes', () => {
    beforeEach(() => {
        mockUseWindowDimensions.mockReturnValue({windowWidth: 400, windowHeight: 800});
    });

    describe('portrait mode (isInLandscapeMode = false)', () => {
        it('returns the correct previewItemSize', () => {
            const {result} = renderHook(() => useReceiptPreviewsSizes(false));

            // previewItemSize = receiptPlaceholder.width + receiptPlaceholder.marginRight = 44 + 8 = 52
            expect(result.current.previewItemSize).toBe(52);
        });

        it('returns the correct previewsSize', () => {
            const {result} = renderHook(() => useReceiptPreviewsSizes(false));

            // previewsSize = receiptPlaceholder.height + pv2.paddingVertical * 2 = 52 + 8 * 2 = 68
            expect(result.current.previewsSize).toBe(68);
        });

        it('returns the correct initialReceiptsAmount', () => {
            const {result} = renderHook(() => useReceiptPreviewsSizes(false));

            // initialReceiptsAmount = (windowWidth - ph4.paddingHorizontal * 2 - singleAvatarMedium.width) / previewItemSize
            // = (400 - 16 * 2 - 52) / 52 = 316 / 52
            expect(result.current.initialReceiptsAmount).toBe(316 / 52);
        });

        it('initialReceiptsAmount scales with windowWidth', () => {
            mockUseWindowDimensions.mockReturnValue({windowWidth: 520, windowHeight: 800});

            const {result} = renderHook(() => useReceiptPreviewsSizes(false));

            // (520 - 16 * 2 - 52) / 52 = 436 / 52
            expect(result.current.initialReceiptsAmount).toBe(436 / 52);
        });

        it('previewsSize and previewItemSize are unaffected by window dimensions', () => {
            mockUseWindowDimensions.mockReturnValue({windowWidth: 1200, windowHeight: 900});

            const {result} = renderHook(() => useReceiptPreviewsSizes(false));

            expect(result.current.previewsSize).toBe(68);
            expect(result.current.previewItemSize).toBe(52);
        });
    });

    describe('landscape mode (isInLandscapeMode = true)', () => {
        it('returns the correct previewItemSize', () => {
            const {result} = renderHook(() => useReceiptPreviewsSizes(true));

            // previewItemSize = receiptPlaceholderLandscape.height + receiptPlaceholderLandscape.marginBottom = 52 + 8 = 60
            expect(result.current.previewItemSize).toBe(60);
        });

        it('returns the correct previewsSize', () => {
            const {result} = renderHook(() => useReceiptPreviewsSizes(true));

            // previewsSize = receiptPlaceholderLandscape.width + ph6.paddingHorizontal * 2 = 44 + 24 * 2 = 92
            expect(result.current.previewsSize).toBe(92);
        });

        it('returns the correct initialReceiptsAmount', () => {
            const {result} = renderHook(() => useReceiptPreviewsSizes(true));

            // initialReceiptsAmount = (windowHeight - submitButtonHeight - tabSelectorButtonHeight - contentHeaderHeight) / previewItemSize
            // submitButtonHeight = singleAvatarMedium.height = 52
            // tabSelectorButtonHeight = tabSelectorButtonHeight (40) + pb4.paddingBottom (16) = 56
            // contentHeaderHeight = 100 (variables.contentHeaderHeight capped at maxValue in test environment)
            // = (800 - 52 - 56 - 100) / 60 = 592 / 60
            expect(result.current.initialReceiptsAmount).toBe(592 / 60);
        });

        it('initialReceiptsAmount scales with windowHeight', () => {
            mockUseWindowDimensions.mockReturnValue({windowWidth: 400, windowHeight: 600});

            const {result} = renderHook(() => useReceiptPreviewsSizes(true));

            // (600 - 52 - 56 - 100) / 60 = 392 / 60
            expect(result.current.initialReceiptsAmount).toBe(392 / 60);
        });

        it('previewsSize and previewItemSize are unaffected by window dimensions', () => {
            mockUseWindowDimensions.mockReturnValue({windowWidth: 300, windowHeight: 1200});

            const {result} = renderHook(() => useReceiptPreviewsSizes(true));

            expect(result.current.previewsSize).toBe(92);
            expect(result.current.previewItemSize).toBe(60);
        });
    });

    describe('switching between portrait and landscape', () => {
        it('returns different previewItemSize values for portrait vs landscape', () => {
            const {result: portraitResult} = renderHook(() => useReceiptPreviewsSizes(false));
            const {result: landscapeResult} = renderHook(() => useReceiptPreviewsSizes(true));

            expect(portraitResult.current.previewItemSize).not.toBe(landscapeResult.current.previewItemSize);
        });

        it('returns different previewsSize values for portrait vs landscape', () => {
            const {result: portraitResult} = renderHook(() => useReceiptPreviewsSizes(false));
            const {result: landscapeResult} = renderHook(() => useReceiptPreviewsSizes(true));

            expect(portraitResult.current.previewsSize).not.toBe(landscapeResult.current.previewsSize);
        });

        it('updates when isInLandscapeMode changes', () => {
            const {result, rerender} = renderHook(({isInLandscapeMode}: {isInLandscapeMode: boolean}) => useReceiptPreviewsSizes(isInLandscapeMode), {
                initialProps: {isInLandscapeMode: false},
            });

            const portraitPreviewItemSize = result.current.previewItemSize;

            rerender({isInLandscapeMode: true});

            expect(result.current.previewItemSize).not.toBe(portraitPreviewItemSize);
            expect(result.current.previewItemSize).toBe(60);
        });
    });
});
