import {act, render, screen, waitFor} from '@testing-library/react-native';

import type {AttachmentCarouselPagerActionsContextType, AttachmentCarouselPagerStateContextType} from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import AttachmentView from '@components/Attachments/AttachmentView';
import type {AttachmentViewProps} from '@components/Attachments/AttachmentView';
import DefaultAttachmentView from '@components/Attachments/AttachmentView/DefaultAttachmentView';
import Icon from '@components/Icon';
import Image from '@components/Image';
import type {ImageProps} from '@components/Image/types';
import type ImageViewProps from '@components/ImageView/types';
import type MultiGestureCanvas from '@components/MultiGestureCanvas';
import PDFView from '@components/PDFView';
import type {PDFViewProps} from '@components/PDFView/types';
import PerDiemEReceipt from '@components/PerDiemEReceipt';

import type useCanvasSize from '@hooks/useCanvasSize';
import type useNetwork from '@hooks/useNetwork';
import type useStyleUtils from '@hooks/useStyleUtils';
import type useThemeStyles from '@hooks/useThemeStyles';

import {add as addCachedPDFPaths} from '@libs/actions/CachedPDFPaths';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import {getValidatedImageSource} from '@libs/AvatarUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import type * as FileUtilsModule from '@libs/fileDownload/FileUtils';
import {getFileResolution} from '@libs/fileDownload/FileUtils';

import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

import type {AssetDescriptor} from 'expo-asset';
import type * as ExpoModulesCore from 'expo-modules-core';
import type ReactModule from 'react';
import type {Image as RNImage, View as RNView} from 'react-native';

import {Asset} from 'expo-asset';

import type * as WebImageViewModule from '../../src/components/ImageView/index';
import type * as NativeImageViewModule from '../../src/components/ImageView/index.native';

import createMock from '../utils/createMock';

// Explicit filenames execute both platform implementations under native-preferring Jest.
const MockWebImageView = jest.requireActual<typeof WebImageViewModule>('../../src/components/ImageView/index.tsx').default;
const MockNativeImageView = jest.requireActual<typeof NativeImageViewModule>('../../src/components/ImageView/index.native.tsx').default;

type AttachmentAssetID = Extract<Parameters<typeof Asset.fromModule>[0], number>;
type AttachmentAssetMetadata = Pick<Asset, 'name' | 'type' | 'width' | 'height'> & {hash: NonNullable<Asset['hash']>};
type AttachmentAssetFixture = {metadata: AttachmentAssetMetadata; platformSource: ReturnType<typeof RNImage.resolveAssetSource>};
const mockAttachmentAssets = new Map<AttachmentAssetID, AttachmentAssetFixture>();
const mockGetAssetByID = jest.fn<AttachmentAssetMetadata | undefined, [AttachmentAssetID]>((id) => mockAttachmentAssets.get(id)?.metadata);
const mockResolveAssetSource = jest.fn<ReturnType<typeof RNImage.resolveAssetSource>, Parameters<typeof RNImage.resolveAssetSource>>((source) => {
    const fixture = typeof source === 'number' ? mockAttachmentAssets.get(source) : undefined;
    if (!fixture) {
        throw new Error('Attachment platform source requires a supplied asset ID');
    }
    return fixture.platformSource;
});
const mockNativeAssetDownload = jest.fn<Promise<NonNullable<Asset['localUri']>>, [Asset['uri'], Asset['hash'], Asset['type']]>();
const mockUpdatePlayback = jest.fn();
let mockCachedSource: string | undefined;
let mockAttachmentIsOffline = false;
const mockAttachmentNetworkListeners = new Set<() => void>();
function setAttachmentNetworkOffline(isOffline: boolean) {
    mockAttachmentIsOffline = isOffline;
    for (const listener of mockAttachmentNetworkListeners) {
        listener();
    }
}
let mockAttachmentPlatform: 'web desktop' | 'web touch' | 'native' = 'native';
let mockPagerState: AttachmentCarouselPagerStateContextType | null = null;
let mockPagerActions: AttachmentCarouselPagerActionsContextType | null = null;
const mockImageMounted = jest.fn();
const mockAttachmentStyles = createMock<ReturnType<typeof useThemeStyles>>({});
const mockAttachmentStyleUtils = createMock<ReturnType<typeof useStyleUtils>>({
    getZoomSizingStyle: () => ({}),
    getZoomCursorStyle: () => ({}),
    getFullscreenCenteredContentStyles: () => [],
    getOpacityStyle: (opacity) => ({opacity}),
    getHighResolutionInfoWrapperStyle: () => ({}),
});
const mockAttachmentCanvasSize = {canvasSize: {width: 320, height: 240}, isCanvasLoading: false, updateCanvasSize: () => {}} satisfies ReturnType<typeof useCanvasSize>;

// Supply platform and I/O boundaries below the installed Asset JavaScript, without replacing its methods.
jest.mock('@react-native/assets-registry/registry', () => ({getAssetByID: (id: AttachmentAssetID) => mockGetAssetByID(id)}));
jest.mock('react-native/Libraries/Image/resolveAssetSource', () => {
    const {default: actualResolveAssetSource} = jest.requireActual<{default: typeof RNImage.resolveAssetSource}>('react-native/Libraries/Image/resolveAssetSource');
    return {
        __esModule: true,
        default: Object.assign((...args: Parameters<typeof RNImage.resolveAssetSource>) => mockResolveAssetSource(...args), actualResolveAssetSource),
    };
});
jest.mock('expo-modules-core', () => {
    const actual = jest.requireActual<typeof ExpoModulesCore>('expo-modules-core');
    const platform = {...actual.Platform, OS: 'web'} satisfies typeof ExpoModulesCore.Platform;
    return {
        ...actual,
        Platform: platform,
        requireOptionalNativeModule: jest.fn<null, [Parameters<typeof ExpoModulesCore.requireOptionalNativeModule>[0]]>(() => null),
        requireNativeModule: (name: Parameters<typeof ExpoModulesCore.requireNativeModule>[0]) => {
            if (name === 'ExpoGo') {
                throw new Error('The supplied asset platform runs outside Expo Go');
            }
            if (name !== 'ExpoAsset') {
                return actual.requireNativeModule<unknown>(name);
            }
            return {downloadAsync: (...args: [Asset['uri'], Asset['hash'], Asset['type']]) => mockNativeAssetDownload(...args)};
        },
    };
});
jest.mock('@components/PDFView', () => {
    const React = jest.requireActual<typeof ReactModule>('react');
    const {View} = jest.requireActual<{View: typeof RNView}>('react-native');
    return jest.fn<ReactModule.ReactElement, [PDFViewProps]>(() => <View testID="pdf-view" />);
});
jest.mock('@components/Image', () => {
    const React = jest.requireActual<typeof ReactModule>('react');
    const {View} = jest.requireActual<{View: typeof RNView}>('react-native');
    function MockAttachmentImage() {
        React.useEffect(() => {
            mockImageMounted();
        }, []);
        return <View testID="attachment-image" />;
    }
    return jest.fn<ReactModule.ReactElement, [ImageProps]>(MockAttachmentImage);
});
jest.mock('@components/ImageView', () => {
    const React = jest.requireActual<typeof ReactModule>('react');
    return {
        __esModule: true,
        default: (props: ImageViewProps) => {
            const ImageComponent = mockAttachmentPlatform === 'native' ? MockNativeImageView : MockWebImageView;
            return <ImageComponent {...props} />;
        },
    };
});
jest.mock('@components/Icon', () => {
    const React = jest.requireActual<typeof ReactModule>('react');
    const {View} = jest.requireActual<{View: typeof RNView}>('react-native');
    return jest.fn<ReactModule.ReactElement, Parameters<typeof Icon>>(() => <View testID="attachment-icon" />);
});
jest.mock('@components/Attachments/AttachmentView/DefaultAttachmentView', () => {
    const React = jest.requireActual<typeof ReactModule>('react');
    const {View} = jest.requireActual<{View: typeof RNView}>('react-native');
    return jest.fn<ReactModule.ReactElement, Parameters<typeof DefaultAttachmentView>>(() => <View testID="default-attachment" />);
});
jest.mock('@components/PerDiemEReceipt', () => {
    const React = jest.requireActual<typeof ReactModule>('react');
    const {View} = jest.requireActual<{View: typeof RNView}>('react-native');
    return jest.fn<ReactModule.ReactElement, Parameters<typeof PerDiemEReceipt>>(() => <View testID="per-diem-receipt" />);
});
jest.mock('@components/EReceipt', () => {
    const React = jest.requireActual<typeof ReactModule>('react');
    const {View} = jest.requireActual<{View: typeof RNView}>('react-native');
    return jest.fn(() => <View testID="e-receipt" />);
});
jest.mock('@components/ScaledDistanceEReceipt', () => {
    const React = jest.requireActual<typeof ReactModule>('react');
    const {View} = jest.requireActual<{View: typeof RNView}>('react-native');
    return jest.fn(() => <View testID="distance-receipt" />);
});
jest.mock('@components/Attachments/AttachmentView/AttachmentViewVideo', () => {
    const React = jest.requireActual<typeof ReactModule>('react');
    const {View} = jest.requireActual<{View: typeof RNView}>('react-native');
    return jest.fn(() => <View testID="attachment-video" />);
});
jest.mock('@components/Attachments/MultiGestureIcon', () => {
    const React = jest.requireActual<typeof ReactModule>('react');
    const {View} = jest.requireActual<{View: typeof RNView}>('react-native');
    return jest.fn(() => <View testID="gesture-icon" />);
});
jest.mock('@components/MultiGestureCanvas', () => {
    const React = jest.requireActual<typeof ReactModule>('react');
    const {View} = jest.requireActual<{View: typeof RNView}>('react-native');
    return {__esModule: true, DEFAULT_ZOOM_RANGE: {min: 1, max: 5}, default: ({children}: Parameters<typeof MultiGestureCanvas>[0]) => <View>{children}</View>};
});
jest.mock('@components/Pressable/PressableWithoutFeedback', () => {
    const React = jest.requireActual<typeof ReactModule>('react');
    const {View} = jest.requireActual<{View: typeof RNView}>('react-native');
    return {__esModule: true, default: ({children}: ReactModule.PropsWithChildren) => <View>{children}</View>};
});
jest.mock('@components/ActivityIndicator', () => {
    const React = jest.requireActual<typeof ReactModule>('react');
    const {View} = jest.requireActual<{View: typeof RNView}>('react-native');
    return () => <View />;
});
jest.mock('@components/LoadingIndicator', () => {
    const React = jest.requireActual<typeof ReactModule>('react');
    const {View} = jest.requireActual<{View: typeof RNView}>('react-native');
    return () => <View />;
});
jest.mock('@components/AttachmentOfflineIndicator', () => {
    const React = jest.requireActual<typeof ReactModule>('react');
    const {View} = jest.requireActual<{View: typeof RNView}>('react-native');
    return () => <View testID="attachment-offline" />;
});
jest.mock('@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext', () => ({
    useAttachmentCarouselPagerActions: () => mockPagerActions,
    useAttachmentCarouselPagerState: () => mockPagerState,
}));
jest.mock('@components/OnyxListItemProvider', () => ({useSession: () => ({encryptedAuthToken: 'session-token'})}));
jest.mock('@components/VideoPlayerContexts/PlaybackContext', () => ({usePlaybackActionsContext: () => ({updateCurrentURLAndReportID: mockUpdatePlayback})}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/useReportOrReportDraft', () => () => undefined);
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useFirstRenderRoute', () => () => ({isFocused: true}));
jest.mock('@hooks/useSafeAreaPaddings', () => () => ({safeAreaPaddingBottomStyle: {}}));
jest.mock('@hooks/useTheme', () => () => ({icon: '#000000'}));
jest.mock('@hooks/useThemeStyles', () => () => mockAttachmentStyles);
jest.mock('@hooks/useStyleUtils', () => () => mockAttachmentStyleUtils);
jest.mock('@hooks/useCanvasSize', () => () => mockAttachmentCanvasSize);
jest.mock('@hooks/useNetwork', () => {
    const React = jest.requireActual<typeof ReactModule>('react');
    return () => {
        const isOffline = React.useSyncExternalStore(
            (listener) => {
                mockAttachmentNetworkListeners.add(listener);
                return () => mockAttachmentNetworkListeners.delete(listener);
            },
            () => mockAttachmentIsOffline,
        );
        return {isOffline} satisfies ReturnType<typeof useNetwork>;
    };
});
jest.mock('@hooks/useCachedAttachmentSource', () => () => mockCachedSource);
jest.mock('@hooks/useClickZoomPan', () => () => ({isZoomed: false, isDragging: false, resetZoom: () => {}}));
jest.mock('@libs/DeviceCapabilities', () => ({canUseTouchScreen: jest.fn(() => false)}));
jest.mock('@libs/actions/CachedPDFPaths', () => ({add: jest.fn()}));
jest.mock('@libs/fileDownload/FileUtils', () => ({...jest.requireActual<typeof FileUtilsModule>('@libs/fileDownload/FileUtils'), getFileResolution: jest.fn()}));

const mockPDFView = jest.mocked(PDFView);
const mockImage = jest.mocked(Image);
const mockFileResolution = jest.mocked(getFileResolution);
const mockTouchScreen = jest.mocked(canUseTouchScreen);
const pdfFile = {name: 'receipt.pdf', type: 'application/pdf'} satisfies AttachmentViewProps['file'];

function supplyAttachmentAsset(type: 'pdf' | 'PDF' | 'png', name: string, id: AttachmentAssetID = mockAttachmentAssets.size + 1): AttachmentAssetID {
    const descriptor = {
        hash: `${name}-${type}`,
        name,
        type,
        width: null,
        height: null,
        uri: `https://example.com/assets/${name}.${type}`,
    } satisfies AssetDescriptor;
    mockAttachmentAssets.set(id, {
        metadata: {name: descriptor.name, type: descriptor.type, hash: descriptor.hash, width: descriptor.width, height: descriptor.height},
        platformSource: {uri: descriptor.uri, scale: 1, width: 0, height: 0},
    } satisfies AttachmentAssetFixture);
    return id;
}

describe('AttachmentView PDF resolution with supplied registry metadata', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCachedSource = undefined;
        mockAttachmentPlatform = 'native';
        mockAttachmentIsOffline = false;
        mockPagerState = null;
        mockPagerActions = null;
        mockTouchScreen.mockReturnValue(false);
        mockFileResolution.mockResolvedValue(null);
        mockAttachmentAssets.clear();
        mockNativeAssetDownload.mockReset().mockResolvedValue('file:///cache/receipt.pdf');
    });

    afterEach(() => jest.restoreAllMocks());

    it('materializes a numeric PDF from supplied metadata and preserves the selected viewer callbacks', async () => {
        // Given route normalization preserves a supplied PDF ID independently of the filename.
        const assetID = supplyAttachmentAsset('PDF', 'supplied-receipt', 42);
        const source = getValidatedImageSource(String(assetID));
        expect(source).toBe(assetID);
        expect(getValidatedImageSource('42')).toBe(42);
        if (source === undefined) {
            throw new Error('Attachment route must produce the supplied source');
        }
        let finishDownload: ((uri: string) => void) | undefined;
        mockNativeAssetDownload.mockImplementation(
            () =>
                new Promise<string>((resolve) => {
                    finishDownload = resolve;
                }),
        );
        const onPDFLoadError = jest.fn();
        render(
            <AttachmentView
                source={source}
                file={pdfFile}
                isAuthTokenRequired
                onPDFLoadError={onPDFLoadError}
                reportActionID="action-1"
            />,
        );
        expect(screen.getByTestId('default-attachment')).toBeTruthy();
        expect(DefaultAttachmentView).toHaveBeenCalledWith(expect.objectContaining({shouldShowLoadingSpinnerIcon: true}), undefined);
        expect(mockPDFView).not.toHaveBeenCalled();

        // When installed Asset.downloadAsync completes through its transport boundary.
        expect(finishDownload).toBeDefined();
        if (!finishDownload) {
            throw new Error('Asset transport must start before completion');
        }
        const completeDownload = finishDownload;
        await act(async () => {
            completeDownload('file:///cache/receipt.pdf');
        });
        const viewerProps = mockPDFView.mock.calls.at(-1)?.[0];
        expect(viewerProps).toBeDefined();
        if (!viewerProps) {
            throw new Error('Resolved PDF must reach the viewer');
        }
        act(() => viewerProps.onLoadComplete('/cache/viewer.pdf'));

        // Then the real PDF wrapper receives a URI without static-asset session auth and retains caching.
        expect(screen.getByTestId('pdf-view')).toBeTruthy();
        expect(viewerProps.sourceURL).toBe('file:///cache/receipt.pdf');
        expect(mockGetAssetByID).toHaveBeenCalledWith(assetID);
        expect(mockResolveAssetSource).toHaveBeenCalledWith(assetID);
        expect(mockNativeAssetDownload).toHaveBeenCalledWith('https://example.com/assets/supplied-receipt.PDF', 'supplied-receipt-PDF', 'PDF');
        expect(addCachedPDFPaths).toHaveBeenCalledWith('action-1', '/cache/viewer.pdf');
        expect(onPDFLoadError).not.toHaveBeenCalled();
        expect(viewerProps.onLoadError).toBeDefined();
        act(() => viewerProps.onLoadError?.());
        expect(onPDFLoadError).toHaveBeenCalledTimes(1);
        expect(mockImage).toHaveBeenCalled();
        expect(mockImage.mock.calls.at(-1)?.[0].source).toBe(assetID);
    });

    it.each(['missing', 'non-pdf', 'download-error', 'empty-uri'] as const)('uses the existing PDF failure transition for %s', async (failure) => {
        // Given a numeric candidate can fail lookup, metadata, I/O or usable URI checks.
        const source = failure === 'missing' ? 2147483647 : supplyAttachmentAsset(failure === 'non-pdf' ? 'png' : 'pdf', failure);
        if (failure === 'download-error') {
            mockNativeAssetDownload.mockRejectedValue(new Error('Resource unavailable'));
        } else if (failure === 'empty-uri') {
            mockNativeAssetDownload.mockResolvedValue('');
        }
        const onPDFLoadError = jest.fn();

        // When the actual AttachmentView and Asset implementation resolve this candidate.
        render(
            <AttachmentView
                source={source}
                file={pdfFile}
                onPDFLoadError={onPDFLoadError}
            />,
        );
        await waitFor(() => expect(onPDFLoadError).toHaveBeenCalledTimes(1));

        // Then the existing numeric image branch follows the failure, without URL coercion.
        expect(mockPDFView).not.toHaveBeenCalled();
        expect(mockImage).toHaveBeenCalled();
        expect(mockImage.mock.calls.at(-1)?.[0].source).toBe(source);
        expect(mockGetAssetByID).toHaveBeenCalledWith(source);
        if (failure === 'missing' || failure === 'non-pdf') {
            expect(mockNativeAssetDownload).not.toHaveBeenCalled();
        }
        if (failure === 'missing') {
            expect(() => Asset.fromModule(source)).toThrow(`Module "${source}" is missing from the asset registry`);
            expect(mockResolveAssetSource).not.toHaveBeenCalled();
        } else {
            expect(mockResolveAssetSource).toHaveBeenCalledWith(source);
            if (failure !== 'non-pdf') {
                expect(mockNativeAssetDownload).toHaveBeenCalledWith(`https://example.com/assets/${failure}.pdf`, `${failure}-pdf`, 'pdf');
            }
        }
    });

    it.each(['stale-first', 'current-first'] as const)('starts offscreen PDF materialization only after focus and ignores stale source completion (%s)', async (order) => {
        // Given carousel pages may become focused or change before asset I/O finishes.
        const firstSource = supplyAttachmentAsset('pdf', 'first-stale');
        const secondSource = supplyAttachmentAsset('pdf', 'second-current');
        const pendingDownloads: Array<(uri: string) => void> = [];
        mockNativeAssetDownload.mockImplementation(
            () =>
                new Promise<string>((resolve) => {
                    pendingDownloads.push(resolve);
                }),
        );
        const onPDFLoadError = jest.fn();
        const {rerender} = render(
            <AttachmentView
                source={firstSource}
                file={pdfFile}
                isFocused={false}
                onPDFLoadError={onPDFLoadError}
            />,
        );
        expect(mockNativeAssetDownload).not.toHaveBeenCalled();

        // When focus enables work and the source then changes while the first download is pending.
        rerender(
            <AttachmentView
                source={firstSource}
                file={pdfFile}
                isFocused
                onPDFLoadError={onPDFLoadError}
            />,
        );
        rerender(
            <AttachmentView
                source={secondSource}
                file={pdfFile}
                isFocused
                onPDFLoadError={onPDFLoadError}
            />,
        );
        expect(pendingDownloads).toHaveLength(2);
        expect(mockGetAssetByID.mock.calls).toEqual([[firstSource], [secondSource]]);
        expect(mockResolveAssetSource.mock.calls).toEqual([[firstSource], [secondSource]]);
        expect(mockNativeAssetDownload.mock.calls).toEqual([
            ['https://example.com/assets/first-stale.pdf', 'first-stale-pdf', 'pdf'],
            ['https://example.com/assets/second-current.pdf', 'second-current-pdf', 'pdf'],
        ]);
        const [finishStale, finishCurrent] = pendingDownloads;
        if (!finishStale || !finishCurrent) {
            throw new Error('Both source downloads must start before completion');
        }
        if (order === 'stale-first') {
            await act(async () => finishStale('file:///cache/stale.pdf'));
            expect(mockPDFView).not.toHaveBeenCalled();
            await act(async () => finishCurrent('file:///cache/current.pdf'));
        } else {
            await act(async () => finishCurrent('file:///cache/current.pdf'));
            expect(mockPDFView.mock.calls.at(-1)?.[0].sourceURL).toBe('file:///cache/current.pdf');
            await act(async () => finishStale('file:///cache/stale.pdf'));
        }

        // Then only the current numeric source owns the viewer URL and no stale error escapes.
        expect(mockPDFView.mock.calls.at(-1)?.[0].sourceURL).toBe('file:///cache/current.pdf');
        expect(onPDFLoadError).not.toHaveBeenCalled();
    });

    it.each(['unmount', 'blur', 'upload'] as const)('ignores a pending asset rejection after %s', async (change) => {
        // Given supplied PDF metadata starts the real Asset download, whose native transport is pending.
        const source = supplyAttachmentAsset('pdf', `cancel-${change}`);
        let failDownload: ((reason: Error) => void) | undefined;
        mockNativeAssetDownload.mockImplementation(
            () =>
                new Promise<string>((_resolve, reject) => {
                    failDownload = reject;
                }),
        );
        const onPDFLoadError = jest.fn();
        const {unmount, rerender} = render(
            <AttachmentView
                source={source}
                file={pdfFile}
                isFocused
                onPDFLoadError={onPDFLoadError}
            />,
        );
        expect(failDownload).toBeDefined();
        if (!failDownload) {
            throw new Error('Asset transport must start before rejection');
        }
        const rejectDownload = failDownload;

        // When this candidate loses eligibility before its transport rejects.
        if (change === 'unmount') {
            unmount();
        } else {
            rerender(
                <AttachmentView
                    source={source}
                    file={pdfFile}
                    isFocused={change !== 'blur'}
                    isUploading={change === 'upload'}
                    onPDFLoadError={onPDFLoadError}
                />,
            );
        }
        await act(async () => {
            rejectDownload(new Error('Late transport failure'));
        });

        // Then stale work never causes the active attachment's failure transition.
        expect(onPDFLoadError).not.toHaveBeenCalled();
        expect(mockPDFView).not.toHaveBeenCalled();
    });

    it('preserves icon, per-diem and upload precedence ahead of numeric PDF resolution', () => {
        // Given numeric source classification must respect earlier attachment branches.
        const source = supplyAttachmentAsset('pdf', 'precedence');
        const transaction = createMock<Transaction>({transactionID: 'per-diem', iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM});

        // When an icon, generated per-diem receipt, or uploading image owns rendering.
        const {rerender} = render(
            <AttachmentView
                source={source}
                file={pdfFile}
                maybeIcon
            />,
        );
        expect(Icon).toHaveBeenCalled();
        rerender(
            <AttachmentView
                source={source}
                file={pdfFile}
                transaction={transaction}
            />,
        );
        expect(PerDiemEReceipt).toHaveBeenCalled();
        rerender(
            <AttachmentView
                source={source}
                file={pdfFile}
                isUploading
            />,
        );

        // Then PDF resource work stays behind precedence and uploading retains the numeric image.
        expect(mockNativeAssetDownload).not.toHaveBeenCalled();
        expect(mockPDFView).not.toHaveBeenCalled();
        expect(mockImage.mock.calls.at(-1)?.[0].source).toBe(source);
    });

    it.each(['https://example.com/receipt.pdf', 'blob:receipt'] as const)('keeps string/blob PDF authentication for %s', (source) => {
        // Given ordinary PDF sources already provide viewer URLs, including filename-classified blobs.
        const expectedURL = addEncryptedAuthTokenToURL(source, 'session-token');

        // When the real attachment selects a string PDF with authentication required.
        render(
            <AttachmentView
                source={source}
                file={pdfFile}
                isAuthTokenRequired
            />,
        );

        // Then URL auth behavior is unchanged and numeric materialization is unnecessary.
        expect(mockPDFView.mock.calls.at(-1)?.[0].sourceURL).toBe(expectedURL);
        expect(mockNativeAssetDownload).not.toHaveBeenCalled();
    });

    it('retains cached image and high-resolution preview priority', async () => {
        // Given the attachment cache can replace an image and high-resolution previews take precedence.
        mockCachedSource = 'blob:cached-image';
        mockFileResolution.mockResolvedValue({width: CONST.MAX_IMAGE_PIXEL_COUNT + 1, height: 1});
        const {rerender} = render(
            <AttachmentView
                source={42}
                file={{name: 'image.png'}}
                previewSource="https://example.com/preview.png"
            />,
        );
        expect(mockImage.mock.calls.at(-1)?.[0].source).toEqual({uri: 'blob:cached-image'});

        // When resolution identifies a large image and then a string fallback is needed.
        await waitFor(() => expect(mockImage.mock.calls.at(-1)?.[0].source).toEqual({uri: 'https://example.com/preview.png'}));
        mockFileResolution.mockResolvedValue(null);
        rerender(
            <AttachmentView
                source={42}
                file={{name: 'small.png'}}
                fallbackSource="https://example.com/fallback.png"
            />,
        );
        await waitFor(() => expect(mockImage.mock.calls.at(-1)?.[0].source).toEqual({uri: 'blob:cached-image'}));
        const imageProps = mockImage.mock.calls.at(-1)?.[0];
        expect(imageProps).toBeDefined();
        if (!imageProps?.onError) {
            throw new Error('Settled cached image must expose its error callback');
        }
        const onImageError = imageProps.onError;
        act(() => onImageError());

        // Then fallback keeps its string identity through the actual image consumer.
        expect(mockImage.mock.calls.at(-1)?.[0].source).toEqual({uri: 'https://example.com/fallback.png'});
    });
});

describe('ImageView platform numeric contracts', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockTouchScreen.mockReturnValue(false);
        mockAttachmentIsOffline = false;
        mockPagerState = null;
        mockPagerActions = null;
        mockAttachmentAssets.clear();
    });

    it.each([
        ['web desktop', MockWebImageView, false],
        ['web touch', MockWebImageView, true],
        ['native', MockNativeImageView, true],
    ] as const)('passes numeric assets directly through %s', (_platform, ImageComponent, touch) => {
        // Given both platform implementations accept a numeric image source.
        const source = supplyAttachmentAsset('png', `numeric-${_platform}`);
        mockTouchScreen.mockReturnValue(touch);
        const props = {url: source, fileName: 'image.png'} satisfies ImageViewProps;

        // When the actual sibling and its real Lightbox branch render.
        render(<ImageComponent {...props} />);

        // Then Image receives the number directly, avoiding URI wrapping or coercion.
        expect(mockImage).toHaveBeenCalled();
        for (const [imageProps] of mockImage.mock.calls) {
            expect(imageProps.source).toBe(source);
        }
    });

    it('keeps numeric and same-text string dimension cache entries distinct', () => {
        // Given native Lightbox caches dimensions under the original URI domain.
        const numericSource = supplyAttachmentAsset('png', 'cache-domain');
        const {unmount} = render(
            <MockNativeImageView
                url={numericSource}
                fileName="image.png"
            />,
        );
        const firstImageProps = mockImage.mock.calls.at(0)?.[0];
        expect(firstImageProps).toBeDefined();
        if (!firstImageProps?.onLoad) {
            throw new Error('Numeric image must expose its load callback before cache probes');
        }

        // When the numeric image loads and a string with identical text mounts afterwards.
        act(() => firstImageProps.onLoad?.({nativeEvent: {width: 400, height: 300}}));
        unmount();
        mockImage.mockClear();
        render(
            <MockNativeImageView
                url={String(numericSource)}
                fileName="image.png"
            />,
        );

        // Then the string image still waits on its own dimensions and keeps URI-object rendering.
        expect(mockImage).toHaveBeenCalled();
        expect(mockImage.mock.calls.at(0)?.[0].source).toEqual({uri: String(numericSource)});
        expect(mockImage.mock.calls.at(0)?.[0].style).not.toContainEqual({width: 400, height: 300});
    });
});

const previewSourceCases: Array<[string, ImageViewProps['url'], boolean]> = [
    ['remote object', {uri: 'https://example.com/object.png'}, true],
    ['file object', {uri: 'file:///object.png'}, true],
    ['blob object', {uri: 'blob:object'}, true],
    ['relative object', {uri: '/object.png'}, true],
    ['source array', [{uri: 'https://example.com/array.png'}, {uri: 'file:///array.png'}], true],
    ['empty array', [], true],
    ['remote string', 'https://example.com/remote.png', true],
    ['empty string', '', true],
    ['zero', 0, true],
    ['numeric asset', 42, false],
    ['blob string', 'blob:primitive', false],
    ['file string', 'file:///primitive.png', false],
    ['relative string', '/primitive.png', false],
];

describe.each([
    ['web desktop', MockWebImageView, false],
    ['web touch', MockWebImageView, true],
    ['native', MockNativeImageView, true],
] as const)('%s preview source and offline contracts', (_platform, ImageComponent, touch) => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAttachmentIsOffline = false;
        mockPagerState = null;
        mockPagerActions = null;
        mockTouchScreen.mockReturnValue(touch);
    });

    it.each(previewSourceCases)('retains %s identity and observable offline locality', (_case, source, expectedOffline) => {
        // Given unknown dimensions keep the actual offline branch observable after loading ends.
        mockAttachmentIsOffline = true;
        const {rerender} = render(
            <ImageComponent
                url={source}
                fileName="source.png"
            />,
        );
        expect(screen.queryByTestId('attachment-offline')).toBeNull();
        const selectedImage = mockImage.mock.calls.find(([props]) => props.onLoadEnd !== undefined)?.[0];
        expect(selectedImage).toBeDefined();
        if (!selectedImage?.onLoadEnd) {
            throw new Error('Preview image must expose its real load-end callback');
        }
        if (typeof source === 'string') {
            expect(selectedImage.source).toEqual({uri: source});
        } else {
            expect(selectedImage.source).toBe(source);
        }

        // When loading ends online without reporting dimensions, indication remains suppressed.
        act(() => {
            setAttachmentNetworkOffline(false);
            selectedImage.onLoadEnd?.();
        });
        rerender(
            <ImageComponent
                url={source}
                fileName="source.png"
            />,
        );
        expect(screen.queryByTestId('attachment-offline')).toBeNull();
        act(() => setAttachmentNetworkOffline(true));
        rerender(
            <ImageComponent
                url={source}
                fileName="source.png"
            />,
        );

        // Then offline indication follows primitive locality and never projects an object's URI.
        expect(screen.queryByTestId('attachment-offline') !== null).toBe(expectedOffline);
        expect(mockImage).toHaveBeenCalled();
        for (const [props] of mockImage.mock.calls) {
            if (typeof source === 'string') {
                expect(props.source).toEqual({uri: source});
            } else {
                expect(props.source).toBe(source);
            }
        }
    });

    it('preserves the web desktop chat attachment override', () => {
        // Given chat attachment paths have a web desktop override but retain helper locality in Lightbox.
        mockAttachmentIsOffline = true;
        render(
            <ImageComponent
                url="/chat-attachments/receipt.png"
                fileName="receipt.png"
            />,
        );
        const selectedImage = mockImage.mock.calls.find(([props]) => props.onLoadEnd !== undefined)?.[0];
        expect(selectedImage).toBeDefined();
        if (!selectedImage?.onLoadEnd) {
            throw new Error('Chat attachment preview must expose load end');
        }

        // When loading ends with dimensions still unknown, the existing indicator condition executes.
        act(() => selectedImage.onLoadEnd?.());

        // Then only the web desktop branch applies its existing override.
        expect(screen.queryByTestId('attachment-offline') !== null).toBe(_platform === 'web desktop');
    });
});

describe.each(['web desktop', 'web touch', 'native'] as const)('AttachmentView %s object and array branches', (platform) => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCachedSource = undefined;
        mockAttachmentPlatform = 'native';
        mockAttachmentIsOffline = false;
        mockPagerState = null;
        mockPagerActions = null;
        mockTouchScreen.mockReturnValue(false);
        mockFileResolution.mockResolvedValue(null);
        mockAttachmentPlatform = platform;
        mockTouchScreen.mockReturnValue(platform !== 'web desktop');
    });

    it.each([{source: {uri: 'https://example.com/original.png'}}, {source: [{uri: 'https://example.com/original-array.png'}]}, {source: []}] satisfies Array<{
        source: ImageViewProps['url'];
    }>)('keeps original image and fallback source identity for %p', async ({source}) => {
        // Given supported object/array image sources and fallbacks must survive the actual attachment seam.
        const fallback = Array.isArray(source) ? [{uri: 'file:///fallback.png'}] : {uri: 'blob:fallback'};
        render(
            <AttachmentView
                source={source}
                file={{name: 'image.png'}}
                fallbackSource={fallback}
            />,
        );
        await waitFor(() => expect(mockImage).toHaveBeenCalled());
        const selectedImage = mockImage.mock.calls.at(-1)?.[0];
        expect(selectedImage).toBeDefined();
        if (!selectedImage?.onError) {
            throw new Error('Actual attachment image must expose its error callback');
        }
        expect(selectedImage.source).toBe(source);

        // When the actual image error callback selects the object/array fallback.
        act(() => selectedImage.onError?.());

        // Then the real AttachmentViewImage, ImageView and Lightbox preserve fallback identity.
        expect(mockImage.mock.calls.at(-1)?.[0].source).toBe(fallback);
    });

    it('retains a truthy empty-array fallback ahead of cached source', async () => {
        // Given an empty array remains a truthy source and outranks the cached image after failure.
        const fallback: ImageViewProps['url'] = [];
        mockCachedSource = 'blob:cached';
        render(
            <AttachmentView
                source={{uri: 'original.png'}}
                file={{name: 'image.png'}}
                fallbackSource={fallback}
            />,
        );
        await waitFor(() => expect(mockImage).toHaveBeenCalled());
        const selectedImage = mockImage.mock.calls.at(-1)?.[0];
        expect(selectedImage).toBeDefined();
        if (!selectedImage?.onError) {
            throw new Error('Cached image must expose its failure callback');
        }
        expect(selectedImage.source).toEqual({uri: 'blob:cached'});

        // When the actual image reports failure.
        act(() => selectedImage.onError?.());

        // Then no emptiness filter replaces the exact array with cached or original source.
        expect(mockImage.mock.calls.at(-1)?.[0].source).toBe(fallback);
    });

    it.each([{source: {uri: 'receipt.pdf'}}, {source: [{uri: 'receipt.pdf'}]}, {source: []}] satisfies Array<{source: ImageViewProps['url']}>)(
        'fails eligible object/array PDFs without asset lookup or string viewer forwarding for %p',
        async ({source}) => {
            // Given object and array PDFs cannot satisfy the string-only PDF viewer boundary.
            const onPDFLoadError = jest.fn();
            const {rerender} = render(
                <AttachmentView
                    source={source}
                    file={pdfFile}
                    isFocused={false}
                    onPDFLoadError={onPDFLoadError}
                />,
            );
            expect(screen.getByTestId('default-attachment')).toBeTruthy();
            expect(onPDFLoadError).not.toHaveBeenCalled();

            // When focus makes the candidate eligible, the existing PDF failure transition settles.
            rerender(
                <AttachmentView
                    source={source}
                    file={pdfFile}
                    isFocused
                    onPDFLoadError={onPDFLoadError}
                />,
            );
            await waitFor(() => expect(onPDFLoadError).toHaveBeenCalledTimes(1));

            // Then neither Asset nor PDFView receives the source, and the existing default branch resumes.
            expect(mockGetAssetByID).not.toHaveBeenCalled();
            expect(mockNativeAssetDownload).not.toHaveBeenCalled();
            expect(mockPDFView).not.toHaveBeenCalled();
            expect(screen.getByTestId('default-attachment')).toBeTruthy();
        },
    );

    it('keeps object/array PDF failure behind generated receipts and upload precedence', async () => {
        // Given prior generated-receipt and upload branches decide eligibility before PDF failure.
        const source = {uri: 'receipt.pdf'};
        const onPDFLoadError = jest.fn();
        const perDiem = createMock<Transaction>({transactionID: 'per-diem', iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM});
        const eReceipt = createMock<Transaction>({transactionID: 'e-receipt', hasEReceipt: true});
        const {rerender} = render(
            <AttachmentView
                source={source}
                file={pdfFile}
                transaction={perDiem}
                onPDFLoadError={onPDFLoadError}
            />,
        );
        expect(screen.getByTestId('per-diem-receipt')).toBeTruthy();
        rerender(
            <AttachmentView
                source={source}
                file={pdfFile}
                transaction={eReceipt}
                onPDFLoadError={onPDFLoadError}
            />,
        );
        expect(screen.getByTestId('e-receipt')).toBeTruthy();
        rerender(
            <AttachmentView
                source={source}
                file={{...pdfFile, type: 'image/png'}}
                isUploading
                onPDFLoadError={onPDFLoadError}
            />,
        );
        expect(mockImage).toHaveBeenCalled();
        expect(mockImage.mock.calls.at(-1)?.[0].source).toBe(source);
        expect(onPDFLoadError).not.toHaveBeenCalled();

        // When upload ends, the same source becomes eligible for the existing error transition.
        rerender(
            <AttachmentView
                source={source}
                file={{...pdfFile, type: 'image/png'}}
                onPDFLoadError={onPDFLoadError}
            />,
        );
        await waitFor(() => expect(onPDFLoadError).toHaveBeenCalledTimes(1));

        // Then failure falls through to the image branch by original identity without asset I/O.
        expect(mockImage.mock.calls.at(-1)?.[0].source).toBe(source);
        expect(mockGetAssetByID).not.toHaveBeenCalled();
        expect(mockPDFView).not.toHaveBeenCalled();
    });
});

describe.each([
    ['web touch', MockWebImageView],
    ['native', MockNativeImageView],
] as const)('%s Lightbox key and cache identity', (_platform, ImageComponent) => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAttachmentIsOffline = false;
        mockPagerState = null;
        mockPagerActions = null;
        mockTouchScreen.mockReturnValue(true);
    });

    it('preserves plain object and singleton-array key collisions and primitive/long-array remounts', () => {
        // Given React historically coerces plain URI objects and singleton arrays to the same key.
        const first = {uri: `${_platform}-first.png`};
        const second = {uri: `${_platform}-second.png`};
        const {rerender} = render(
            <ImageComponent
                url={first}
                fileName="image.png"
            />,
        );
        expect(mockImageMounted).toHaveBeenCalledTimes(1);
        const selectedImage = mockImage.mock.calls.at(-1)?.[0];
        expect(selectedImage).toBeDefined();
        if (!selectedImage?.onLoad) {
            throw new Error('Lightbox must expose dimension reporting before key probes');
        }
        act(() => selectedImage.onLoad?.({nativeEvent: {width: 440, height: 220}}));

        // When colliding source keys change, Lightbox remains mounted with its current dimensions.
        rerender(
            <ImageComponent
                url={second}
                fileName="image.png"
            />,
        );
        expect(mockImageMounted).toHaveBeenCalledTimes(1);
        expect(mockImage.mock.calls.at(-1)?.[0].source).toBe(second);
        expect(mockImage.mock.calls.at(-1)?.[0].style).toContainEqual({width: 440, height: 220});
        const singleton = [second];
        rerender(
            <ImageComponent
                url={singleton}
                fileName="image.png"
            />,
        );
        expect(mockImageMounted).toHaveBeenCalledTimes(1);
        expect(mockImage.mock.calls.at(-1)?.[0].source).toBe(singleton);
        const longer = [first, second];
        rerender(
            <ImageComponent
                url={longer}
                fileName="image.png"
            />,
        );
        expect(mockImageMounted).toHaveBeenCalledTimes(2);
        expect(mockImage.mock.calls.at(-1)?.[0].source).toBe(longer);
        expect(mockImage.mock.calls.at(-1)?.[0].style).not.toContainEqual({width: 440, height: 220});
        rerender(
            <ImageComponent
                url={42}
                fileName="image.png"
            />,
        );
        expect(mockImageMounted).toHaveBeenCalledTimes(3);
        rerender(
            <ImageComponent
                url={43}
                fileName="image.png"
            />,
        );

        // Then different primitive keys and array lengths retain their effective remounts.
        expect(mockImageMounted).toHaveBeenCalledTimes(4);
        expect(mockImage.mock.calls.at(-1)?.[0].source).toBe(43);
    });

    it.each([false, true])('uses original object/array cache keys independently of URI text (array=%s)', (array) => {
        // Given dimensions belong to the source identity rather than its URI or React key text.
        const original = array ? [{uri: `${_platform}-cache.png`}] : {uri: `${_platform}-cache.png`};
        const equalText = array ? [{uri: `${_platform}-cache.png`}] : {uri: `${_platform}-cache.png`};
        const firstRender = render(
            <ImageComponent
                url={original}
                fileName="image.png"
            />,
        );
        const selectedImage = mockImage.mock.calls.at(-1)?.[0];
        expect(selectedImage).toBeDefined();
        if (!selectedImage?.onLoad) {
            throw new Error('Original source must report dimensions before cache lookup');
        }

        // When the original source loads, a separately allocated equal-text source still starts unknown.
        act(() => selectedImage.onLoad?.({nativeEvent: {width: 510, height: 260}}));
        firstRender.unmount();
        mockImage.mockClear();
        const secondRender = render(
            <ImageComponent
                url={equalText}
                fileName="image.png"
            />,
        );
        expect(mockImage).toHaveBeenCalled();
        expect(mockImage.mock.calls.at(-1)?.[0].source).toBe(equalText);
        expect(mockImage.mock.calls.at(-1)?.[0].style).not.toContainEqual({width: 510, height: 260});
        secondRender.unmount();
        mockImage.mockClear();
        render(
            <ImageComponent
                url={original}
                fileName="image.png"
            />,
        );

        // Then remounting the same original identity retrieves its existing dimensions.
        expect(mockImage).toHaveBeenCalled();
        expect(mockImage.mock.calls.at(-1)?.[0].source).toBe(original);
        expect(mockImage.mock.calls.at(-1)?.[0].style).toContainEqual({width: 510, height: 260});
    });

    it('forwards the same array through both carousel Image branches and retains opacity values', () => {
        // Given an active carousel item renders its gesture image and fallback while dimensions are unknown.
        const source = [{uri: `${_platform}-carousel.png`}];
        mockPagerActions = {};
        mockPagerState = {
            pagerItems: [
                {source, index: 0, isActive: true},
                {source: 'other.png', index: 1, isActive: false},
            ],
            activePage: 0,
            pagerRef: {current: null},
            isPagerScrolling: createMock<AttachmentCarouselPagerStateContextType['isPagerScrolling']>({value: false}),
            isScrollEnabled: createMock<AttachmentCarouselPagerStateContextType['isScrollEnabled']>({value: false}),
        };

        // When the actual Lightbox renders both image branches beneath the real platform ImageView.
        render(
            <ImageComponent
                url={source}
                fileName="image.png"
            />,
        );
        expect(screen.getAllByTestId('attachment-image')).toHaveLength(2);
        expect(mockImage).toHaveBeenCalledTimes(2);

        // Then both Image calls retain the original array and the fixture computes actual opacity.
        for (const [props] of mockImage.mock.calls) {
            expect(props.source).toBe(source);
        }
        expect(mockAttachmentStyleUtils.getOpacityStyle(0)).toEqual({opacity: 0});
        expect(mockAttachmentStyleUtils.getOpacityStyle(1)).toEqual({opacity: 1});
    });
});
