// cspell:ignore RNBF RNPDF
/**
 * Runs the real react-native-pdf JS (node_modules/react-native-pdf/index.js, with our patches) with react-native-blob-util
 * mocked. NativePDFViewTest mocks react-native-pdf out, so it can't catch problems in the library's own download code.
 *
 * Regression tests for https://github.com/Expensify/App/issues/106338: changing the PDF source while a download was
 * running threw "undefined is not a function" from `lastRNBFTask.cancel()` as an unhandled promise rejection.
 */
import {render, screen} from '@testing-library/react-native';

import {createHash} from 'crypto';
import React from 'react';
import Pdf from 'react-native-pdf';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type MockResponse = {respInfo: {headers: Record<string, string>}};

type MockTask = Promise<MockResponse> & {
    uri: string;
    isCanceled: boolean;
    cancel: jest.Mock;
    progress: () => MockTask;
    finish: () => void;
    fail: (error: Error) => void;
};

const mockTasks: MockTask[] = [];
const mockCachedFiles = new Set<string>();
// Cache checks wait for this before they settle, so a test can change the source while one is running
let mockCacheCheckGate: Promise<void> = Promise.resolve();

jest.mock('react-native-blob-util', () => {
    const createTask = (uri: string): MockTask => {
        let resolveTask: (response: MockResponse) => void = () => {};
        let rejectTask: (reason: unknown) => void = () => {};
        let isSettled = false;
        const promise = new Promise<MockResponse>((resolve, reject) => {
            resolveTask = resolve;
            rejectTask = reject;
        });

        const task: MockTask = Object.assign(promise, {
            uri,
            isCanceled: false,
            progress: () => task,
            // Like react-native-blob-util: cancel() rejects the task, and once the task has settled it's a no-op that
            // never calls its callback
            cancel: jest.fn((callback?: (error: unknown) => void) => {
                if (isSettled) {
                    return;
                }
                isSettled = true;
                task.isCanceled = true;
                rejectTask(new Error('canceled'));
                callback?.(null);
            }),
            finish: () => {
                isSettled = true;
                resolveTask({respInfo: {headers: {}}});
            },
            fail: (error: Error) => {
                isSettled = true;
                rejectTask(error);
            },
        });
        mockTasks.push(task);
        return task;
    };

    return {
        __esModule: true,
        default: {
            config: () => ({fetch: (_method: string, uri: string) => createTask(uri)}),
            fs: {
                dirs: {CacheDir: '/cache'},
                stat: jest.fn((path: string) => mockCacheCheckGate.then(() => (mockCachedFiles.has(path) ? {lastModified: Date.now()} : Promise.reject(new Error('not cached'))))),
                unlink: jest.fn(() => Promise.resolve()),
                cp: jest.fn(() => Promise.resolve()),
            },
        },
    };
});

jest.mock('react-native-pdf/fabric/RNPDFPdfNativeComponent', () => ({__esModule: true, default: 'RNPDFPdfView', Commands: {}}));
jest.mock('react-native-pdf/PdfView', () => () => null);

type PdfInternals = {
    state: {path: string; isDownloaded: boolean};
    // eslint-disable-next-line @typescript-eslint/naming-convention -- react-native-pdf's own method name
    _downloadFile: (...args: unknown[]) => Promise<void>;
};

function isPdfInternals(instance: unknown): instance is PdfInternals {
    return typeof instance === 'object' && instance !== null && 'state' in instance && '_downloadFile' in instance;
}

const URL_WITH_OLD_TOKEN = 'https://www.expensify.com/receipts/w_1.pdf?encryptedAuthToken=old';
const URL_WITH_NEW_TOKEN = 'https://www.expensify.com/receipts/w_1.pdf?encryptedAuthToken=new';

// react-native-pdf names the cache file after the SHA-1 of the URI
const getCacheFile = (uri: string) => `/cache/${createHash('sha1').update(uri).digest('hex')}.pdf`;

function renderPdf(uri: string, onError: jest.Mock) {
    const renderWithSource = (sourceURI: string) => (
        <Pdf
            source={{uri: sourceURI, cache: true, expiration: 864000}}
            onError={onError}
        />
    );
    const {rerender} = render(renderWithSource(uri));
    const pdf: unknown = screen.UNSAFE_getByType(Pdf).instance;
    if (!isPdfInternals(pdf)) {
        throw new Error('Expected the react-native-pdf component instance');
    }

    // The library doesn't await _downloadFile, so in the app a rejection from it is an unhandled promise rejection
    const escapedRejections: unknown[] = [];
    const {_downloadFile: downloadFile} = pdf;
    jest.spyOn(pdf, '_downloadFile').mockImplementation((...args) => {
        const download = downloadFile(...args);
        download.catch((error: unknown) => escapedRejections.push(error));
        return download;
    });

    return {pdf, escapedRejections, changeSource: (nextURI: string) => rerender(renderWithSource(nextURI))};
}

describe('react-native-pdf download cancellation', () => {
    beforeEach(() => {
        mockTasks.length = 0;
        mockCachedFiles.clear();
        mockCacheCheckGate = Promise.resolve();
    });

    it('cancels the old download and shows the new source when the source changes during a download', async () => {
        // Given a PDF whose download is still running
        const onError = jest.fn();
        const {pdf, escapedRejections, changeSource} = renderPdf(URL_WITH_OLD_TOKEN, onError);
        await waitForBatchedUpdatesWithAct();

        // When the auth token in its URL is refreshed and the new download finishes
        changeSource(URL_WITH_NEW_TOKEN);
        await waitForBatchedUpdatesWithAct();
        mockTasks.at(1)?.finish();
        await waitForBatchedUpdatesWithAct();

        // Then the old download is canceled without an error and the new one is shown
        expect(mockTasks.map((task) => task.uri)).toEqual([URL_WITH_OLD_TOKEN, URL_WITH_NEW_TOKEN]);
        expect(mockTasks.at(0)?.isCanceled).toBe(true);
        expect(escapedRejections).toEqual([]);
        expect(onError).not.toHaveBeenCalled();
        expect(pdf.state).toMatchObject({path: getCacheFile(URL_WITH_NEW_TOKEN), isDownloaded: true});
    });

    it('ignores a download that finished just before the source changed', async () => {
        // Given a PDF whose download finishes right when its source changes to one that's already cached
        const onError = jest.fn();
        const {pdf, escapedRejections, changeSource} = renderPdf(URL_WITH_OLD_TOKEN, onError);
        await waitForBatchedUpdatesWithAct();
        mockCachedFiles.add(getCacheFile(URL_WITH_NEW_TOKEN));

        // When the finished download is handled after the source changed
        mockTasks.at(0)?.finish();
        changeSource(URL_WITH_NEW_TOKEN);
        await waitForBatchedUpdatesWithAct();

        // Then the new source stays shown
        expect(escapedRejections).toEqual([]);
        expect(onError).not.toHaveBeenCalled();
        expect(pdf.state).toMatchObject({path: getCacheFile(URL_WITH_NEW_TOKEN), isDownloaded: true});
    });

    it('ignores a cache check that finishes after the source changed', async () => {
        // Given a PDF whose cache check is still running
        let finishCacheChecks: () => void = () => {};
        mockCacheCheckGate = new Promise((resolve) => {
            finishCacheChecks = resolve;
        });
        const onError = jest.fn();
        const {pdf, escapedRejections, changeSource} = renderPdf(URL_WITH_OLD_TOKEN, onError);

        // When the source changes to a cached file before that check ends
        mockCachedFiles.add(getCacheFile(URL_WITH_NEW_TOKEN));
        changeSource(URL_WITH_NEW_TOKEN);
        finishCacheChecks();
        await waitForBatchedUpdatesWithAct();

        // Then the old source isn't downloaded and the new one is shown
        expect(mockTasks).toHaveLength(0);
        expect(escapedRejections).toEqual([]);
        expect(onError).not.toHaveBeenCalled();
        expect(pdf.state).toMatchObject({path: getCacheFile(URL_WITH_NEW_TOKEN), isDownloaded: true});
    });

    it('reports a failed download once', async () => {
        // Given a PDF whose download is running
        const onError = jest.fn();
        const {pdf, escapedRejections} = renderPdf(URL_WITH_NEW_TOKEN, onError);
        await waitForBatchedUpdatesWithAct();

        // When the download fails
        const networkError = new Error('network failure');
        mockTasks.at(0)?.fail(networkError);
        await waitForBatchedUpdatesWithAct();

        // Then the error is reported once and nothing is shown as downloaded
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(networkError);
        expect(pdf.state.isDownloaded).toBe(false);
        expect(escapedRejections).toEqual([]);
    });
});
