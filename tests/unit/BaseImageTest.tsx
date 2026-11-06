import {act, render, renderHook} from '@testing-library/react-native';

import type {BaseImageProps} from '@components/Image/types';

import useCachedImageSource from '@hooks/useCachedImageSource';

import AttachmentStateContextProvider, {AttachmentStateContext} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/AttachmentStateContextProvider';

import {fontScale} from '@styles/typography';

import type {ImageLoadEventData, ImageProps as ExpoImageProps} from 'expo-image';

import React, {useContext} from 'react';
import {View} from 'react-native';

import type * as WebBaseImageModule from '../../src/components/Image/BaseImage';
import type * as NativeBaseImageModule from '../../src/components/Image/BaseImage.native';

import createMock from '../utils/createMock';

// Exact filenames keep Jest's native preference from selecting both subjects as native.
const WebBaseImage = jest.requireActual<typeof WebBaseImageModule>('../../src/components/Image/BaseImage.tsx').default;
const NativeBaseImage = jest.requireActual<typeof NativeBaseImageModule>('../../src/components/Image/BaseImage.native.tsx').default;

const mockRenderExpoImage = jest.fn<React.ReactElement, [ExpoImageProps]>(() => <View testID="expo-image" />);

jest.mock('expo-image', () => ({Image: (props: ExpoImageProps) => mockRenderExpoImage(props)}));
jest.mock('@hooks/useCachedImageSource', () => jest.fn());

const mockCachedImageSource = jest.mocked(useCachedImageSource);
const imageLoadEvent = createMock<ImageLoadEventData>({source: {width: 320, height: 180}});

function renderAttachmentImage(ImageComponent: typeof WebBaseImage, props: BaseImageProps) {
    return renderHook(() => useContext(AttachmentStateContext), {
        wrapper: ({children}) => (
            <AttachmentStateContextProvider>
                <ImageComponent {...props} />
                {children}
            </AttachmentStateContextProvider>
        ),
    });
}

describe('BaseImage platform contracts', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCachedImageSource.mockReturnValue(undefined);
    });

    describe.each([
        ['web', WebBaseImage],
        ['native', NativeBaseImage],
    ] as const)('%s', (_platform, ImageComponent) => {
        it.each([{source: 42}, {source: {uri: 'https://example.com/a.png'}}, {source: [{uri: 'a'}, {uri: 'b'}]}] satisfies Array<Pick<BaseImageProps, 'source'>>)(
            'keeps source and style identity for %p',
            ({source}) => {
                // Given registered and URI sources already have identities understood by the renderer.
                const dimensions = [{width: 320}, {height: 180}];
                const symbolStyle = {fontWeight: 600, fontSize: fontScale.pageHeader, color: '#123456'} satisfies NonNullable<BaseImageProps['style']>;
                const namedSymbolStyle = {fontWeight: 'semibold'} satisfies NonNullable<BaseImageProps['style']>;
                const style: BaseImageProps['style'] = [dimensions, symbolStyle, namedSymbolStyle];
                const onLoad = jest.fn<ReturnType<NonNullable<BaseImageProps['onLoad']>>, Parameters<NonNullable<BaseImageProps['onLoad']>>>();
                const {result} = renderAttachmentImage(ImageComponent, {source, style, onLoad});
                const expoProps = mockRenderExpoImage.mock.calls.at(-1)?.[0];
                expect(expoProps).toBeDefined();
                if (!expoProps) {
                    throw new Error('Expo image must render before inspecting its props');
                }

                // When the renderer reports dimensions, the real component tracks the original source.
                if (!expoProps.onLoad) {
                    throw new Error('Expo must expose the selected load callback');
                }
                act(() => expoProps.onLoad?.(imageLoadEvent));

                // Then styles and sources pass through by identity and callbacks keep the shared shape.
                expect(expoProps.source).toBe(source);
                expect(expoProps.style).toBe(style);
                expect(expoProps.style).toEqual([dimensions, symbolStyle, namedSymbolStyle]);
                expect(style[0]).toBe(dimensions);
                expect(style[1]).toBe(symbolStyle);
                expect(style[2]).toBe(namedSymbolStyle);
                expect(onLoad).toHaveBeenCalledWith({nativeEvent: {width: 320, height: 180}});
                expect(result.current.isAttachmentLoaded(source)).toBe(true);
            },
        );

        it('does not register load events without a caller handler', () => {
            // Given the image can render without dimension reporting.
            const source = {uri: 'without-handler.png'};

            // When the real sibling mounts without onLoad.
            renderAttachmentImage(ImageComponent, {source});

            // Then the Expo transport receives no unnecessary load subscription.
            expect(mockRenderExpoImage).toHaveBeenCalled();
            expect(mockRenderExpoImage.mock.calls.at(-1)?.[0].onLoad).toBeUndefined();
        });
    });

    it('uses cached null on web while tracking the original source', () => {
        // Given null means authenticated cache loading is pending, rather than a cache miss.
        const source = {uri: 'https://example.com/auth.png', headers: {token: 'auth'}};
        mockCachedImageSource.mockReturnValue(null);
        const onLoad = jest.fn<ReturnType<NonNullable<BaseImageProps['onLoad']>>, Parameters<NonNullable<BaseImageProps['onLoad']>>>();
        const {result} = renderAttachmentImage(WebBaseImage, {source, onLoad});
        const expoProps = mockRenderExpoImage.mock.calls.at(-1)?.[0];
        expect(expoProps).toBeDefined();
        if (!expoProps) {
            throw new Error('Expo image must render before inspecting its props');
        }

        // When a renderer completion arrives, cache tracking still belongs to the original URI.
        if (!expoProps.onLoad) {
            throw new Error('Expo must expose the selected load callback');
        }
        act(() => expoProps.onLoad?.(imageLoadEvent));

        // Then null was rendered and the original key became loaded.
        expect(expoProps.source).toBeNull();
        expect(result.current.isAttachmentLoaded(source)).toBe(true);
    });

    it('uses a cached web URI without changing the attachment key', () => {
        // Given the browser cache has materialized an authenticated image.
        const source = {uri: 'https://example.com/auth.png'};
        const cachedSource = {uri: 'blob:cached-image'};
        mockCachedImageSource.mockReturnValue(cachedSource);
        const {result} = renderAttachmentImage(WebBaseImage, {source, onLoad: () => {}});
        const expoProps = mockRenderExpoImage.mock.calls.at(-1)?.[0];
        expect(expoProps).toBeDefined();
        if (!expoProps) {
            throw new Error('Expo image must render before inspecting its props');
        }

        // When the real web sibling processes the completion.
        if (!expoProps.onLoad) {
            throw new Error('Expo must expose the selected load callback');
        }
        act(() => expoProps.onLoad?.(imageLoadEvent));

        // Then the renderer uses the cache value and context keeps original-source ownership.
        expect(expoProps.source).toBe(cachedSource);
        expect(result.current.isAttachmentLoaded(source)).toBe(true);
        expect(result.current.isAttachmentLoaded(cachedSource)).toBe(false);
    });

    it('keeps web manual load-start truthiness and dependency behavior', () => {
        // Given web Expo lacks onLoadStart, the component supplies it for truthy sources.
        const onLoadStart = jest.fn<ReturnType<NonNullable<BaseImageProps['onLoadStart']>>, Parameters<NonNullable<BaseImageProps['onLoadStart']>>>();
        const {rerender} = render(
            <WebBaseImage
                source={0}
                onLoadStart={onLoadStart}
            />,
        );
        expect(onLoadStart).not.toHaveBeenCalled();

        // When the source and then callback change, each dependency starts a new load.
        rerender(
            <WebBaseImage
                source={42}
                onLoadStart={onLoadStart}
            />,
        );
        rerender(
            <WebBaseImage
                source={42}
                onLoadStart={onLoadStart}
            />,
        );
        const replacementStart = jest.fn<ReturnType<NonNullable<BaseImageProps['onLoadStart']>>, Parameters<NonNullable<BaseImageProps['onLoadStart']>>>();
        rerender(
            <WebBaseImage
                source={42}
                onLoadStart={replacementStart}
            />,
        );

        // Then identical dependencies do not emit twice, but a new handler does.
        expect(onLoadStart).toHaveBeenCalledTimes(1);
        expect(replacementStart).toHaveBeenCalledTimes(1);
    });

    it('suppresses duplicate native load callbacks and resets on a new source', () => {
        // Given native Expo can emit duplicate loads for one image.
        const onLoad = jest.fn<ReturnType<NonNullable<BaseImageProps['onLoad']>>, Parameters<NonNullable<BaseImageProps['onLoad']>>>();
        const {rerender} = render(
            <NativeBaseImage
                source={42}
                onLoad={onLoad}
            />,
        );
        const firstProps = mockRenderExpoImage.mock.calls.at(-1)?.[0];
        expect(firstProps).toBeDefined();
        if (!firstProps) {
            throw new Error('Expo image must render before inspecting its props');
        }

        // When two loads arrive, followed by a load for a different registered source.
        if (!firstProps.onLoad) {
            throw new Error('Native Expo must expose its selected load callback');
        }
        act(() => {
            firstProps.onLoad?.(imageLoadEvent);
            firstProps.onLoad?.(imageLoadEvent);
        });
        expect(onLoad).toHaveBeenCalledTimes(1);
        rerender(
            <NativeBaseImage
                source={43}
                onLoad={onLoad}
            />,
        );
        const nextProps = mockRenderExpoImage.mock.calls.at(-1)?.[0];
        expect(nextProps).toBeDefined();
        if (!nextProps) {
            throw new Error('Expo image must render before inspecting its props');
        }
        if (!nextProps.onLoad) {
            throw new Error('New native source must expose its load callback');
        }
        act(() => nextProps.onLoad?.(imageLoadEvent));

        // Then each source reports once and dimensions retain the common event shape.
        expect(onLoad).toHaveBeenCalledTimes(2);
        expect(onLoad).toHaveBeenLastCalledWith({nativeEvent: {width: 320, height: 180}});
    });
});

describe('AttachmentStateContext encoding', () => {
    it('preserves numeric, array, object, empty and colliding keys', () => {
        // Given the real provider shares keys using the established comma-space encoding.
        const {result} = renderHook(() => useContext(AttachmentStateContext), {wrapper: AttachmentStateContextProvider});
        const arraySource = [{uri: 'a'}, {uri: 'b'}] satisfies BaseImageProps['source'];

        // When each source category is written through the public context.
        act(() => {
            result.current.setAttachmentLoaded(42);
            result.current.setAttachmentLoaded(arraySource);
            result.current.setAttachmentLoaded({uri: 'object'});
            result.current.setAttachmentLoaded({});
            result.current.setAttachmentLoaded([]);
            result.current.setAttachmentLoaded('');
        });

        // Then collisions, empty keys and default loaded state retain their existing meaning.
        expect(result.current.isAttachmentLoaded('42')).toBe(true);
        expect(result.current.isAttachmentLoaded('a, b')).toBe(true);
        expect(result.current.isAttachmentLoaded({uri: 'a, b'})).toBe(true);
        expect(result.current.isAttachmentLoaded('object')).toBe(true);
        expect(result.current.isAttachmentLoaded('')).toBe(false);
        act(() => result.current.setAttachmentLoaded(42, false));
        expect(result.current.isAttachmentLoaded('42')).toBe(false);
        act(() => result.current.clearAttachmentLoaded());
        expect(result.current.isAttachmentLoaded(arraySource)).toBe(false);
    });

    it('keeps icon functions cannot-cache and undefined throwing before state writes', () => {
        // Given icon functions historically produce an empty key, while undefined is invalid.
        const {result} = renderHook(() => useContext(AttachmentStateContext), {wrapper: AttachmentStateContextProvider});
        const icon = () => <View />;

        // When conversion receives a function or absent source.
        act(() => result.current.setAttachmentLoaded(icon));

        // Then absence is still a TypeError and never becomes a loaded empty key.
        expect(result.current.isAttachmentLoaded(icon)).toBe(false);
        expect(() => result.current.setAttachmentLoaded(undefined)).toThrow(TypeError);
        expect(() => result.current.isAttachmentLoaded(undefined)).toThrow(TypeError);
        expect(result.current.isAttachmentLoaded('')).toBe(false);
    });
});
