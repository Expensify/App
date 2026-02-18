import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import type {View as RNView} from 'react-native';
import type {SharedValue} from 'react-native-reanimated';
import {AttachmentCarouselPagerActionsContext, AttachmentCarouselPagerStateContext} from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import type {AttachmentCarouselPagerActionsContextType, AttachmentCarouselPagerStateContextType} from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import Lightbox from '@components/Lightbox';
import CONST from '@src/CONST';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const TEST_URI = 'https://example.com/image.png';

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

jest.mock('@components/Lightbox/numberOfConcurrentLightboxes', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention -- __esModule is required by Jest to properly mock ES modules with default exports
    __esModule: true,
    default: 3,
}));

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

type ContextValues = {
    stateValue: AttachmentCarouselPagerStateContextType;
    actionsValue: AttachmentCarouselPagerActionsContextType;
};

function createContextValues(activePage: number, itemCount: number): ContextValues {
    return {
        stateValue: {
            pagerItems: createPagerItems(itemCount),
            activePage,
            isPagerScrolling: createSharedValue(false),
            isScrollEnabled: createSharedValue(true),
            pagerRef: {current: null},
        },
        actionsValue: {
            onTap: jest.fn(),
            onScaleChanged: jest.fn(),
            onSwipeDown: jest.fn(),
        },
    };
}

async function renderLightboxInCarousel(attachmentID: string, uri: string, contextValues: ContextValues) {
    render(
        <AttachmentCarouselPagerStateContext.Provider value={contextValues.stateValue}>
            <AttachmentCarouselPagerActionsContext.Provider value={contextValues.actionsValue}>
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
    describe('fallback rendering range', () => {
        it('should not render any image for distant pages outside FALLBACK_OFFSET range', async () => {
            const contextValues = createContextValues(15, 30);

            await renderLightboxInCarousel('attachment-0', TEST_URI, contextValues);

            expect(screen.queryAllByTestId('image')).toHaveLength(0);
        });

        it('should render fallback image for pages within FALLBACK_OFFSET range', async () => {
            const contextValues = createContextValues(15, 30);

            await renderLightboxInCarousel('attachment-13', TEST_URI, contextValues);

            expect(screen.getAllByTestId('image').length).toBeGreaterThan(0);
        });

        it('should render lightbox image for the active page', async () => {
            const contextValues = createContextValues(15, 30);

            await renderLightboxInCarousel('attachment-15', TEST_URI, contextValues);

            expect(screen.getByTestId('multi-gesture-canvas')).toBeTruthy();
            expect(screen.getAllByTestId('image').length).toBeGreaterThan(0);
        });
    });

    describe('image priority', () => {
        it('should assign HIGH priority to the active page image', async () => {
            const contextValues = createContextValues(5, 30);

            await renderLightboxInCarousel('attachment-5', TEST_URI, contextValues);

            const images = screen.getAllByTestId('image');
            expect(images.length).toBeGreaterThan(0);
            for (const image of images) {
                expect(image.props.accessibilityHint).toBe(CONST.IMAGE_LOADING_PRIORITY.HIGH);
            }
        });

        it('should assign NORMAL priority to non-active pages within the lightbox visible range', async () => {
            const contextValues = createContextValues(5, 30);

            await renderLightboxInCarousel('attachment-4', TEST_URI, contextValues);

            const images = screen.getAllByTestId('image');
            expect(images.length).toBeGreaterThan(0);
            for (const image of images) {
                expect(image.props.accessibilityHint).toBe(CONST.IMAGE_LOADING_PRIORITY.NORMAL);
            }
        });

        it('should assign LOW priority to fallback images outside the lightbox window', async () => {
            const contextValues = createContextValues(15, 30);

            await renderLightboxInCarousel('attachment-13', TEST_URI, contextValues);

            const images = screen.getAllByTestId('image');
            expect(images.length).toBeGreaterThan(0);
            for (const image of images) {
                expect(image.props.accessibilityHint).toBe(CONST.IMAGE_LOADING_PRIORITY.LOW);
            }
        });
    });
});
