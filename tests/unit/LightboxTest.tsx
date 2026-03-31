import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import type {View as RNView} from 'react-native';
import type {SharedValue} from 'react-native-reanimated';
import {AttachmentCarouselPagerActionsContext, AttachmentCarouselPagerStateContext} from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import type {AttachmentCarouselPagerActionsContextType, AttachmentCarouselPagerStateContextType} from '@components/Attachments/AttachmentCarousel/Pager/types';
import Lightbox from '@components/Lightbox';
import CONST from '@src/CONST';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- __esModule is required by Jest to properly mock ES modules with default exports
jest.mock('@components/Image', () => {
    const MockReact = require('react') as typeof React;
    const {View} = require('react-native') as {View: typeof RNView};
    function MockImage({priority, testID, ...props}: {priority?: string; testID?: string}) {
        return MockReact.createElement(View, {
            testID: testID ?? 'image',
            accessibilityHint: priority ?? 'none',
            ...props,
        });
    }
    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- __esModule is required by Jest to properly mock ES modules with default exports
        __esModule: true,
        default: MockReact.memo(MockImage),
    };
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- __esModule is required by Jest to properly mock ES modules with default exports
jest.mock('@components/Lightbox/numberOfConcurrentLightboxes', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention -- __esModule is required by Jest to properly mock ES modules with default exports
    __esModule: true,
    default: 3,
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- __esModule is required by Jest to properly mock ES modules with default exports
jest.mock('@components/MultiGestureCanvas', () => {
    const MockReact = require('react') as typeof React;
    const {View} = require('react-native') as {View: typeof RNView};
    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- __esModule is required by Jest to properly mock ES modules with default exports
        __esModule: true,
        default: ({children}: {children: React.ReactNode}) => MockReact.createElement(View, {testID: 'multi-gesture-canvas'}, children),
        DEFAULT_ZOOM_RANGE: {min: 1, max: 5},
    };
});

function createSharedValue<T>(value: T): SharedValue<T> {
    return {
        value,
        get: jest.fn(() => value),
        set: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        modify: jest.fn(),
    } as unknown as SharedValue<T>;
}

function createPagerItems(count: number) {
    return Array.from({length: count}, (_, i) => ({
        source: `https://example.com/image-${i}.png`,
        previewSource: `https://example.com/image-${i}-preview.png`,
        index: i,
        isActive: false,
        attachmentID: `attachment-${i}`,
    }));
}

function createStateValue(activePage: number, itemCount: number): AttachmentCarouselPagerStateContextType {
    return {
        pagerItems: createPagerItems(itemCount),
        activePage,
        isPagerScrolling: createSharedValue(false),
        isScrollEnabled: createSharedValue(true),
        pagerRef: {current: null},
    };
}

function createActionsValue(): AttachmentCarouselPagerActionsContextType {
    return {
        onTap: jest.fn(),
        onScaleChanged: jest.fn(),
        onSwipeDown: jest.fn(),
    };
}

async function renderLightboxInCarousel(
    attachmentID: string | undefined,
    uri: string,
    stateValue: AttachmentCarouselPagerStateContextType,
    actionsValue: AttachmentCarouselPagerActionsContextType,
) {
    render(
        <AttachmentCarouselPagerStateContext.Provider value={stateValue}>
            <AttachmentCarouselPagerActionsContext.Provider value={actionsValue}>
                <Lightbox
                    attachmentID={attachmentID}
                    uri={uri}
                />
            </AttachmentCarouselPagerActionsContext.Provider>
        </AttachmentCarouselPagerStateContext.Provider>,
    );

    await waitForBatchedUpdatesWithAct();

    fireEvent(screen.getByTestId('lightbox-wrapper'), 'onLayout', {
        nativeEvent: {layout: {width: 400, height: 800}},
    });

    await waitForBatchedUpdatesWithAct();
}

describe('Lightbox', () => {
    describe('page resolution with missing attachmentID', () => {
        it('should resolve page correctly using source fallback when attachmentID is undefined', async () => {
            const stateValue: AttachmentCarouselPagerStateContextType = {
                pagerItems: [
                    {source: 'https://example.com/a.png', index: 0, isActive: false, attachmentID: undefined},
                    {source: 'https://example.com/b.png', index: 1, isActive: false, attachmentID: undefined},
                    {source: 'https://example.com/c.png', index: 2, isActive: true, attachmentID: undefined},
                ],
                activePage: 2,
                isPagerScrolling: createSharedValue(false),
                isScrollEnabled: createSharedValue(true),
                pagerRef: {current: null},
            };
            const actionsValue = createActionsValue();

            // Lightbox for the 3rd image (index 2) should resolve to page 2, not page 0
            await renderLightboxInCarousel(undefined, 'https://example.com/c.png', stateValue, actionsValue);

            // The active page lightbox should render the multi-gesture-canvas
            expect(screen.getByTestId('multi-gesture-canvas')).toBeTruthy();
        });
    });

    describe('page resolution when attachment is not found in pagerItems', () => {
        it('should fall back to page 0 and still render when findIndex returns -1', async () => {
            const stateValue = createStateValue(0, 5);
            const actionsValue = createActionsValue();

            // Use an attachmentID and uri that don't match any pagerItem — findIndex returns -1, should fallback to page 0
            await renderLightboxInCarousel('non-existent-id', 'https://example.com/unknown.png', stateValue, actionsValue);

            // Page 0 === activePage 0, so this should be active and render the lightbox
            expect(screen.getByTestId('multi-gesture-canvas')).toBeTruthy();
            expect(screen.getAllByTestId('image').length).toBeGreaterThan(0);
        });
    });

    describe('fallback rendering range', () => {
        it('should not render any image for distant pages outside FALLBACK_OFFSET range', async () => {
            const stateValue = createStateValue(15, 30);
            const actionsValue = createActionsValue();

            await renderLightboxInCarousel('attachment-0', 'https://example.com/image-0.png', stateValue, actionsValue);

            expect(screen.queryAllByTestId('image')).toHaveLength(0);
        });

        it('should render fallback image for pages within FALLBACK_OFFSET range', async () => {
            const stateValue = createStateValue(15, 30);
            const actionsValue = createActionsValue();

            await renderLightboxInCarousel('attachment-13', 'https://example.com/image-13.png', stateValue, actionsValue);

            expect(screen.getAllByTestId('image').length).toBeGreaterThan(0);
        });

        it('should render lightbox image for the active page', async () => {
            const stateValue = createStateValue(15, 30);
            const actionsValue = createActionsValue();

            await renderLightboxInCarousel('attachment-15', 'https://example.com/image-15.png', stateValue, actionsValue);

            expect(screen.getByTestId('multi-gesture-canvas')).toBeTruthy();
            expect(screen.getAllByTestId('image').length).toBeGreaterThan(0);
        });
    });

    describe('image priority', () => {
        it('should assign HIGH priority to the active page image', async () => {
            const stateValue = createStateValue(5, 30);
            const actionsValue = createActionsValue();

            await renderLightboxInCarousel('attachment-5', 'https://example.com/image-5.png', stateValue, actionsValue);

            const images = screen.getAllByTestId('image');
            expect(images.length).toBeGreaterThan(0);
            for (const image of images) {
                expect(image.props.accessibilityHint).toBe(CONST.IMAGE_LOADING_PRIORITY.HIGH);
            }
        });

        it('should assign NORMAL priority to non-active pages within the lightbox visible range', async () => {
            const stateValue = createStateValue(5, 30);
            const actionsValue = createActionsValue();

            // attachment-4 is one page before active (5), within lightbox window (NUMBER_OF_CONCURRENT_LIGHTBOXES=3, offset=1)
            await renderLightboxInCarousel('attachment-4', 'https://example.com/image-4.png', stateValue, actionsValue);

            const images = screen.getAllByTestId('image');
            expect(images.length).toBeGreaterThan(0);
            for (const image of images) {
                expect(image.props.accessibilityHint).toBe(CONST.IMAGE_LOADING_PRIORITY.NORMAL);
            }
        });

        it('should assign LOW priority to fallback images outside the lightbox window', async () => {
            const stateValue = createStateValue(15, 30);
            const actionsValue = createActionsValue();

            // attachment-13 is 2 pages away from active (15), within FALLBACK_OFFSET but outside lightbox window (offset=1)
            await renderLightboxInCarousel('attachment-13', 'https://example.com/image-13.png', stateValue, actionsValue);

            const images = screen.getAllByTestId('image');
            expect(images.length).toBeGreaterThan(0);
            for (const image of images) {
                expect(image.props.accessibilityHint).toBe(CONST.IMAGE_LOADING_PRIORITY.LOW);
            }
        });
    });
});
