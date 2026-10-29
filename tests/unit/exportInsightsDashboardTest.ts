import createDownloadLink from '@libs/fileDownload/createDownloadLink';

import exportInsightsDashboardNative from '@pages/Insights/exportInsightsDashboard/index.native';
import type ExportInsightsDashboard from '@pages/Insights/exportInsightsDashboard/types';
import type {InsightsCaptureRef} from '@pages/Insights/exportInsightsDashboard/types';

import type {Options} from 'modern-screenshot';
import type {View} from 'react-native';

import {Skia} from '@shopify/react-native-skia';
import {domToCanvas} from 'modern-screenshot';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import {captureRef, releaseCapture} from 'react-native-view-shot';

import createMock from '../utils/createMock';

const mockDrawImage = jest.fn();
const mockClear = jest.fn();
const mockImageDispose = jest.fn();
const mockSurfaceDispose = jest.fn();
const mockPaintDispose = jest.fn();
const mockEncode = jest.fn(() => 'png-base64');

jest.mock('@libs/fileDownload/createDownloadLink', () => jest.fn());
jest.mock('modern-screenshot', () => ({domToCanvas: jest.fn()}));
jest.mock('react-native-view-shot', () => ({captureRef: jest.fn(), releaseCapture: jest.fn()}));
jest.mock('react-native-share', () => ({open: jest.fn()}));
jest.mock('react-native-fs', () => ({CachesDirectoryPath: '/cache', writeFile: jest.fn(), unlink: jest.fn()}));
jest.mock('@shopify/react-native-skia', () => ({
    Skia: {
        Surface: {
            MakeOffscreen: jest.fn(() => ({
                getCanvas: () => ({clear: mockClear, drawImage: mockDrawImage}),
                flush: jest.fn(),
                makeImageSnapshot: () => ({encodeToBase64: mockEncode, dispose: mockImageDispose}),
                dispose: mockSurfaceDispose,
            })),
        },
        Data: {fromURI: jest.fn(() => Promise.resolve({dispose: jest.fn()}))},
        Image: {MakeImageFromEncoded: jest.fn(() => ({dispose: mockImageDispose}))},
        Paint: () => ({dispose: mockPaintDispose}),
        Color: (color: string) => color,
    },
}));

const fileName = 'Insights - Spend - This year - 2026-10-16.png';
const backgroundColor = '#101010';
const captureNode = jest.mocked<(node: Node, options?: Options) => Promise<HTMLCanvasElement>>(domToCanvas);
const exportInsightsDashboard = jest.requireActual<{default: ExportInsightsDashboard}>('@pages/Insights/exportInsightsDashboard/index.ts').default;

describe('exportInsightsDashboard on web', () => {
    const fillRect = jest.fn();
    const drawImage = jest.fn();
    const context = createMock<CanvasRenderingContext2D>({fillStyle: '', fillRect, drawImage});
    function getContext(contextId: '2d'): CanvasRenderingContext2D | null;
    function getContext(contextId: 'bitmaprenderer'): ImageBitmapRenderingContext | null;
    function getContext(contextId: 'webgl'): WebGLRenderingContext | null;
    function getContext(contextId: 'webgl2'): WebGL2RenderingContext | null;
    function getContext(contextId: Parameters<HTMLCanvasElement['getContext']>[0]): GPUCanvasContext | null;
    function getContext(contextId: string): RenderingContext | null;
    function getContext(contextId: string): RenderingContext | GPUCanvasContext | null {
        return contextId === '2d' ? context : null;
    }

    beforeEach(() => {
        jest.clearAllMocks();
        Object.defineProperty(document, 'fonts', {configurable: true, value: {ready: Promise.resolve()}});
        jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(getContext);
        jest.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(new Blob(['png'], {type: 'image/png'})));
        jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:insights');
    });

    afterEach(() => jest.restoreAllMocks());

    it('captures the full content at 2x and downloads the exact PNG filename', async () => {
        // Given a page header and filter row above an inset dashboard taller than the viewport
        const header = document.createElement('div');
        const controls = document.createElement('div');
        const content = document.createElement('div');
        jest.spyOn(header, 'getBoundingClientRect').mockReturnValue(createMock<DOMRect>({left: 0}));
        jest.spyOn(controls, 'getBoundingClientRect').mockReturnValue(createMock<DOMRect>({left: 100}));
        jest.spyOn(content, 'getBoundingClientRect').mockReturnValue(createMock<DOMRect>({left: 20}));
        const headerImage = document.createElement('canvas');
        headerImage.width = 1000;
        headerImage.height = 128;
        const controlsImage = document.createElement('canvas');
        controlsImage.width = 400;
        controlsImage.height = 60;
        const contentImage = document.createElement('canvas');
        contentImage.width = 800;
        contentImage.height = 2400;
        captureNode.mockResolvedValueOnce(headerImage).mockResolvedValueOnce(controlsImage).mockResolvedValueOnce(contentImage);

        // When the dashboard is exported
        await exportInsightsDashboard({headerRef: {current: header}, controlsRef: {current: controls}, contentRef: {current: content}, fileName, backgroundColor});

        // Then the header, page margins, bottom padding, and content below the fold are retained
        expect(domToCanvas).toHaveBeenNthCalledWith(1, header, expect.objectContaining({scale: 2, backgroundColor}));
        expect(domToCanvas).toHaveBeenNthCalledWith(2, controls, expect.objectContaining({scale: 2, backgroundColor}));
        expect(domToCanvas).toHaveBeenNthCalledWith(3, content, expect.objectContaining({scale: 2, backgroundColor}));
        expect(fillRect).toHaveBeenCalledWith(0, 0, 1000, 2708);
        expect(drawImage).toHaveBeenCalledWith(headerImage, 0, 0);
        expect(drawImage).toHaveBeenCalledWith(controlsImage, 200, 168);
        expect(drawImage).toHaveBeenCalledWith(contentImage, 40, 268);
        expect(createDownloadLink).toHaveBeenCalledWith('blob:insights', fileName);
    });

    it('propagates a PNG encoding failure instead of downloading an empty file', async () => {
        // Given sections that captured successfully but cannot be encoded
        const element = document.createElement('div');
        captureNode.mockResolvedValue(document.createElement('canvas'));
        jest.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(null));

        // When the dashboard is exported
        const capture = exportInsightsDashboard({headerRef: {current: element}, controlsRef: {current: element}, contentRef: {current: element}, fileName, backgroundColor});

        // Then the caller can restore the button and show its retry error
        await expect(capture).rejects.toThrow('Could not encode Insights image');
        expect(createDownloadLink).not.toHaveBeenCalled();
    });

    it('copies WebGL buffers after redraw and preserves each canvas CSS size in the clone', async () => {
        // Given an avatar before a chart whose discarded drawing buffer is twice its CSS size
        const header = document.createElement('div');
        const controls = document.createElement('div');
        const content = document.createElement('div');
        const avatar = document.createElement('img');
        avatar.src = 'https://example.com/avatar.jpg';
        content.appendChild(avatar);
        const chart = document.createElement('canvas');
        chart.width = 600;
        chart.height = 300;
        content.appendChild(chart);
        jest.spyOn(chart, 'getBoundingClientRect').mockReturnValue(createMock<DOMRect>({width: 300, height: 150}));
        let isRedrawn = false;
        const globals = globalThis as typeof globalThis & {SkiaViewApi?: {views: Record<string, {redraw: () => void}>}};
        const originalSkia = globals.SkiaViewApi;
        const redraw = jest.fn(() =>
            queueMicrotask(() => {
                isRedrawn = true;
            }),
        );
        globals.SkiaViewApi = {views: {chart: {redraw}}};
        jest.spyOn(chart, 'toDataURL').mockImplementation(() => {
            expect(isRedrawn).toBe(true);
            return 'data:image/png;base64,chart';
        });
        captureNode.mockResolvedValue(document.createElement('canvas'));

        try {
            // When the renderer clones the avatar and turns the chart canvas into an image
            await exportInsightsDashboard({headerRef: {current: header}, controlsRef: {current: controls}, contentRef: {current: content}, fileName, backgroundColor});
            const clone = document.createElement('div');
            clone.appendChild(avatar.cloneNode());
            clone.appendChild(document.createElement('img'));
            const [, options] = captureNode.mock.calls.at(2) ?? [];
            await options?.onCloneNode?.(clone);

            // Then the chart snapshot keeps its CSS size without replacing or dropping the avatar
            expect(redraw).toHaveBeenCalledTimes(1);
            expect(clone.querySelector('canvas')).toBeNull();
            expect(clone.querySelector('img')?.src).toBe(avatar.src);
            expect(clone.querySelectorAll('img').item(1).src).toBe('data:image/png;base64,chart');
            expect(clone.querySelectorAll('img').item(1).style.width).toBe('300px');
            expect(clone.querySelectorAll('img').item(1).style.height).toBe('150px');
        } finally {
            globals.SkiaViewApi = originalSkia;
        }
    });
});

describe('exportInsightsDashboard on native', () => {
    function makeRef(height: number, x = 0, width = 400): InsightsCaptureRef {
        return {current: createMock<View>({measureInWindow: (callback) => callback(x, 0, width, height)})};
    }

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(captureRef).mockResolvedValueOnce('file:///header.png').mockResolvedValueOnce('file:///controls.png').mockResolvedValueOnce('file:///content.png');
        jest.mocked(RNFS.writeFile).mockResolvedValue(undefined);
        jest.mocked(RNFS.unlink).mockResolvedValue(undefined);
        jest.mocked(Share.open).mockResolvedValue({success: false, message: ''});
    });

    it('shares a named temporary PNG and cleans up when the share sheet is dismissed', async () => {
        // Given a page header and filter row above an inset dashboard taller than the viewport
        const headerRef = makeRef(64, 0, 500);
        const controlsRef = makeRef(30, 100, 280);
        const contentRef = makeRef(1200, 20);

        // When the dashboard is exported and the user cancels sharing
        await exportInsightsDashboardNative({headerRef, controlsRef, contentRef, fileName, backgroundColor});

        // Then capture uses 2x dimensions, sharing does not treat cancellation as failure, and temporary files are removed
        expect(captureRef).toHaveBeenNthCalledWith(3, contentRef, expect.objectContaining({width: 800, height: 2400, handleGLSurfaceViewOnAndroid: true}));
        expect(Skia.Surface.MakeOffscreen).toHaveBeenCalledWith(1000, 2708);
        expect(mockClear).toHaveBeenCalledWith(backgroundColor);
        expect(mockDrawImage).toHaveBeenNthCalledWith(2, expect.anything(), 200, 168, expect.anything());
        expect(mockDrawImage).toHaveBeenNthCalledWith(3, expect.anything(), 40, 268, expect.anything());
        expect(RNFS.writeFile).toHaveBeenCalledWith(`/cache/${fileName}`, 'png-base64', 'base64');
        expect(Share.open).toHaveBeenCalledWith({url: `file:///cache/${fileName}`, type: 'image/png', failOnCancel: false});
        expect(RNFS.unlink).toHaveBeenCalledWith(`/cache/${fileName}`);
        expect(releaseCapture).toHaveBeenCalledTimes(3);
        expect(mockSurfaceDispose).toHaveBeenCalledTimes(1);
    });

    it('releases a partial capture when the next section fails', async () => {
        // Given a successful header capture followed by a failed filter capture
        jest.mocked(captureRef).mockReset().mockResolvedValueOnce('file:///header.png').mockRejectedValueOnce(new Error('Capture failed'));

        // When the dashboard is exported
        const capture = exportInsightsDashboardNative({headerRef: makeRef(64), controlsRef: makeRef(30), contentRef: makeRef(1200), fileName, backgroundColor});

        // Then the failure reaches the retry handler without leaking the first capture or sharing an incomplete image
        await expect(capture).rejects.toThrow('Capture failed');
        expect(releaseCapture).toHaveBeenCalledWith('file:///header.png');
        expect(mockImageDispose).toHaveBeenCalledTimes(1);
        expect(mockSurfaceDispose).toHaveBeenCalledTimes(1);
        expect(Share.open).not.toHaveBeenCalled();
    });
});
