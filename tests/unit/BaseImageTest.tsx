import {act, render, renderHook} from '@testing-library/react-native';
import Image from '@components/Image';
import BaseImageNative from '@components/Image/BaseImage.native';
import type * as BaseImageModule from '@components/Image/BaseImage';
import useCachedImageSource from '@hooks/useCachedImageSource';
import AttachmentStateContextProvider, {AttachmentStateContext} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/AttachmentStateContextProvider';
import type {ImageLoadEventData, ImageProps as ExpoImageProps} from 'expo-image';
import React, {useContext} from 'react';
import {StyleSheet, View} from 'react-native';

const BaseImage = jest.requireActual<typeof BaseImageModule>('@components/Image/BaseImage.tsx').default;

const mockImage = jest.fn<null, [ExpoImageProps]>(() => null);
jest.mock('expo-image', () => ({Image: (props: ExpoImageProps) => mockImage(props)}));
jest.mock('@hooks/useCachedImageSource', () => ({__esModule: true, default: jest.fn(() => undefined)}));
jest.mock('@components/OnyxListItemProvider', () => ({useSession: () => undefined}));
jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: () => ({isOffline: false})}));
jest.mock('@libs/actions/Session', () => ({isExpiredSession: () => false, isDelegateSession: () => false}));
jest.mock('@libs/actions/Session/AttachmentImageReauthenticator', () => ({__esModule: true, default: jest.fn()}));

const mockCachedSource = jest.mocked(useCachedImageSource);
const setAttachmentLoaded = jest.fn();
const isAttachmentLoaded = jest.fn(() => false);
const context = {setAttachmentLoaded, isAttachmentLoaded, clearAttachmentLoaded: jest.fn()};

function lastImageProps(): ExpoImageProps {
    const call = mockImage.mock.calls.at(-1);
    if (!call) {
        throw new Error('Expected Expo Image to render');
    }
    return call[0];
}

function withContext(child: React.ReactNode) {
    return <AttachmentStateContext.Provider value={context}>{child}</AttachmentStateContext.Provider>;
}

function loadEvent(width: number, height: number): ImageLoadEventData {
    return {cacheType: 'none', source: {url: 'https://example.com/image.png', width, height, mediaType: 'image/png'}};
}

describe('BaseImage platform siblings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCachedSource.mockReturnValue(undefined);
    });

    it('keeps the original web source for context and recycling while rendering its cached URI', () => {
        // Given a cached URI, when web BaseImage renders and loads, then only Expo receives the cache source.
        const source = {uri: 'https://example.com/original.png'};
        const cached = {uri: 'file:///cached.png'};
        mockCachedSource.mockReturnValue(cached);
        const onLoad = jest.fn();
        const onLoadStart = jest.fn();
        const registered = StyleSheet.create({image: {height: 14}}).image;
        const readonlySegment = [registered, false] as const;
        const style: ExpoImageProps['style'] = [{width: 12}, readonlySegment, null, '', undefined];
        render(withContext(<BaseImage source={source} style={style} onLoad={onLoad} onLoadStart={onLoadStart} />));
        const props = lastImageProps();
        expect(props.source).toBe(cached);
        expect(props.style).toBe(style);
        expect(props.recyclingKey).toBe(source.uri);
        expect(isAttachmentLoaded).toHaveBeenCalledWith(source);
        expect(setAttachmentLoaded).toHaveBeenCalledWith(source, false);
        expect(onLoadStart).toHaveBeenCalledTimes(1);
        props.onLoad?.(loadEvent(22, 33));
        expect(setAttachmentLoaded).toHaveBeenCalledWith(source, true);
        expect(onLoad).toHaveBeenCalledWith({nativeEvent: {width: 22, height: 33}});
    });

    it('keeps caller style as the first wrapper member and forwards the outer array unchanged', () => {
        // Given a supported style array, when Image renders, then Expo receives the same caller style in its first outer-array position.
        const registered = StyleSheet.create({image: {height: 14}}).image;
        const callerStyle: ExpoImageProps['style'] = [registered, [{width: 12}, false] as const, null, '', undefined];
        render(withContext(<View accessibilityIgnoresInvertColors><Image source={{uri: 'https://example.com/wrapped.png'}} style={callerStyle} /></View>));
        const receivedStyle = lastImageProps().style;
        expect(Array.isArray(receivedStyle)).toBe(true);
        if (!Array.isArray(receivedStyle)) {
            throw new Error('Expected wrapper style array');
        }
        expect(receivedStyle[0]).toBe(callerStyle);
        expect(receivedStyle).toHaveLength(3);
        expect(receivedStyle[1]).toEqual({});
        expect(receivedStyle[2]).toBe(false);
    });

    it('accepts absent and array sources without changing their context keys', () => {
        // Given absent or ordered URI sources, when web BaseImage mounts, then context receives each original value.
        const array = [{uri: 'first'}, {uri: 'second'}];
        const {rerender} = render(withContext(<BaseImage source={undefined} />));
        expect(setAttachmentLoaded).toHaveBeenCalledWith(undefined, false);
        rerender(withContext(<BaseImage source={array} />));
        expect(lastImageProps().source).toBe(array);
        expect(lastImageProps().recyclingKey).toBe('first');
    });

    it('forwards native load once per source and resets after a source change', () => {
        // Given repeated native load events, when the source changes, then the next source can load once.
        const onLoad = jest.fn();
        const first = {uri: 'first'};
        const second = {uri: 'second'};
        const style: ExpoImageProps['style'] = [StyleSheet.create({image: {width: 10}}).image, false, null];
        const {rerender} = render(withContext(<BaseImageNative source={first} style={style} onLoad={onLoad} />));
        expect(lastImageProps().style).toBe(style);
        lastImageProps().onLoad?.(loadEvent(10, 20));
        lastImageProps().onLoad?.(loadEvent(10, 20));
        expect(onLoad).toHaveBeenCalledTimes(1);
        rerender(withContext(<BaseImageNative source={second} style={style} onLoad={onLoad} />));
        lastImageProps().onLoad?.(loadEvent(30, 40));
        expect(onLoad).toHaveBeenCalledTimes(2);
        expect(onLoad).toHaveBeenLastCalledWith({nativeEvent: {width: 30, height: 40}});
        expect(setAttachmentLoaded).toHaveBeenCalledWith(second, true);
    });

    it('preserves numeric and ordered URI-array attachment keys and ignores absent sources', () => {
        // Given the real attachment context, when sources are stored, then key identity follows its original conversion.
        const {result} = renderHook(() => useContext(AttachmentStateContext), {wrapper: AttachmentStateContextProvider});
        const array = [{uri: 'first'}, {uri: 'second'}];
        act(() => {
            result.current.setAttachmentLoaded(undefined, true);
            result.current.setAttachmentLoaded(42, true);
            result.current.setAttachmentLoaded(array, true);
        });
        expect(result.current.isAttachmentLoaded(undefined)).toBe(false);
        expect(result.current.isAttachmentLoaded(42)).toBe(true);
        expect(result.current.isAttachmentLoaded(array)).toBe(true);
        expect(result.current.isAttachmentLoaded([{uri: 'second'}, {uri: 'first'}])).toBe(false);
    });
});
