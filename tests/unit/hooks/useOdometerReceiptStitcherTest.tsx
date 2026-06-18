import {act, renderHook} from '@testing-library/react-native';
import type useOdometerReceiptStitcherType from '@hooks/useOdometerReceiptStitcher';
import type {UseOdometerReceiptStitcherArgs} from '@hooks/useOdometerReceiptStitcher';
import type * as DeriveOdometerReceiptModule from '@libs/OdometerReceipt/deriveOdometerReceipt';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

type HookModule = {default: typeof useOdometerReceiptStitcherType};
const useOdometerReceiptStitcher = jest.requireActual<HookModule>('@hooks/useOdometerReceiptStitcher/index.ts').default;

// ─── Mocks ──────────────────────────────────────────────────────────────────

// Mock the composed verifier directly — the stitcher tests should not exercise verification logic.
// That logic has its own ownership (the verifier hook) and its own test surface via real flows.
const mockUseRestartOnOdometerImagesFailure = jest.fn<{hasVerifiedBlobs: boolean}, unknown[]>();
jest.mock('@hooks/useRestartOnOdometerImagesFailure', () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockUseRestartOnOdometerImagesFailure(...args),
}));

const mockIsFocused = jest.fn(() => true);
jest.mock('@react-navigation/native', () => ({
    useIsFocused: () => mockIsFocused(),
}));

// Stable translate reference (a fresh object per render would change identity and re-trigger the
// derivation effect's `translate` dep → infinite loop). Declare inside the factory because jest
// hoists jest.mock above imports.
jest.mock('@hooks/useLocalize', () => {
    const stableLocalize = {translate: (key: string) => key};
    return {
        __esModule: true,
        default: () => stableLocalize,
    };
});

const mockSetMoneyRequestReceipt = jest.fn<void, unknown[]>();
jest.mock('@userActions/IOU/Receipt', () => ({
    setMoneyRequestReceipt: (...args: unknown[]) => mockSetMoneyRequestReceipt(...args),
}));

type StitchedResult = {uri: string; name: string; type: string | undefined};
const mockStitchTask = jest.fn<Promise<StitchedResult>, unknown[]>();
jest.mock('@libs/OdometerReceipt', () => {
    const actualDerive = jest.requireActual<typeof DeriveOdometerReceiptModule>('@libs/OdometerReceipt/deriveOdometerReceipt').default;
    return {
        deriveOdometerReceipt: actualDerive,
        stitchTask: (...args: unknown[]) => mockStitchTask(...args),
    };
});

jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {warn: jest.fn(), info: jest.fn()},
}));

// OdometerImageUtils is used inline by the hook. Stub it to break the transitive import chain
// (FileUtils → saveLastRoute → API → ...). The hook only needs getOdometerImageUri.
jest.mock('@libs/OdometerImageUtils', () => ({
    __esModule: true,
    getOdometerImageUri: (image: unknown) => {
        if (typeof image === 'string') {
            return image;
        }
        if (image && typeof image === 'object' && 'uri' in image) {
            return (image as {uri: string}).uri ?? '';
        }
        return '';
    },
    getOdometerImageName: (image: unknown) => {
        if (typeof image === 'string') {
            return image.split('/').pop() ?? '';
        }
        if (image && typeof image === 'object' && 'name' in image) {
            return (image as {name: string}).name ?? '';
        }
        return '';
    },
    getOdometerImageType: (image: unknown) => {
        if (image && typeof image === 'object' && 'type' in image) {
            return (image as {type: string}).type;
        }
        return undefined;
    },
    default: jest.fn(),
}));

// ─── Test helpers ──────────────────────────────────────────────────────────

const TX_ID = 't1';
const REPORT_ID = 'r1';
const IOU_TYPE = CONST.IOU.TYPE.CREATE;

function setVerifierResult({hasVerifiedBlobs = true}: {hasVerifiedBlobs?: boolean} = {}) {
    mockUseRestartOnOdometerImagesFailure.mockImplementation(() => ({hasVerifiedBlobs}));
}

function buildTx(overrides: Partial<OnyxTypes.Transaction> = {}): OnyxTypes.Transaction {
    return {
        transactionID: TX_ID,
        comment: {},
        ...overrides,
    } as OnyxTypes.Transaction;
}

function buildArgs(overrides: Partial<UseOdometerReceiptStitcherArgs> = {}): UseOdometerReceiptStitcherArgs {
    return {
        transaction: buildTx(),
        isOdometerDistanceRequest: true,
        reportID: REPORT_ID,
        iouType: IOU_TYPE,
        backToReport: undefined,
        ...overrides,
    };
}

const startBlob: FileObject = {uri: 'blob:start', name: 'start.jpg', type: 'image/jpeg'};
const endBlob: FileObject = {uri: 'blob:end', name: 'end.jpg', type: 'image/jpeg'};
const stitchedBlob: StitchedResult = {uri: 'blob:stitched', name: 'stitched.jpg', type: 'image/jpeg'};

beforeEach(() => {
    mockUseRestartOnOdometerImagesFailure.mockReset();
    mockIsFocused.mockReturnValue(true);
    mockSetMoneyRequestReceipt.mockReset();
    mockStitchTask.mockReset();
    setVerifierResult();
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('useOdometerReceiptStitcher (web FSM, composes verifier)', () => {
    describe('idle gating', () => {
        it('stays idle when isOdometerDistanceRequest is false; isReady is true; no verifier call shaped at this flow', () => {
            const {result} = renderHook(() => useOdometerReceiptStitcher(buildArgs({isOdometerDistanceRequest: false})));
            expect(result.current.state.kind).toBe('idle');
            expect(result.current.isReady).toBe(true);
            expect(result.current.isStitching).toBe(false);
            expect(result.current.error).toBeNull();
            // The verifier is still called (with undefined transaction) so it bails internally.
            expect(mockUseRestartOnOdometerImagesFailure).toHaveBeenCalled();
            const callArgs = mockUseRestartOnOdometerImagesFailure.mock.calls.at(0);
            expect(callArgs?.at(0)).toBeUndefined();
        });

        it('stays idle when verifier reports hasVerifiedBlobs=false', async () => {
            setVerifierResult({hasVerifiedBlobs: false});
            const tx = buildTx({comment: {odometerStartImage: startBlob, odometerEndImage: endBlob}});
            const {result} = renderHook(() => useOdometerReceiptStitcher(buildArgs({transaction: tx})));
            await act(async () => {
                await Promise.resolve();
            });
            expect(result.current.state.kind).toBe('idle');
            expect(result.current.isReady).toBe(false);
            expect(mockStitchTask).not.toHaveBeenCalled();
            expect(mockSetMoneyRequestReceipt).not.toHaveBeenCalled();
        });

        it('stays idle when not focused', async () => {
            mockIsFocused.mockReturnValue(false);
            const tx = buildTx({comment: {odometerStartImage: startBlob, odometerEndImage: endBlob}});
            const {result} = renderHook(() => useOdometerReceiptStitcher(buildArgs({transaction: tx})));
            await act(async () => {
                await Promise.resolve();
            });
            expect(result.current.state.kind).toBe('idle');
            expect(mockStitchTask).not.toHaveBeenCalled();
        });

        it('stays idle when transaction is undefined', async () => {
            const {result} = renderHook(() => useOdometerReceiptStitcher(buildArgs({transaction: undefined})));
            await act(async () => {
                await Promise.resolve();
            });
            expect(result.current.state.kind).toBe('idle');
            expect(result.current.isReady).toBe(false);
        });
    });

    describe('single-image derivation (synchronous)', () => {
        it('transitions idle → ready, writes the receipt with the single image, does not invoke stitchTask', async () => {
            const tx = buildTx({comment: {odometerStartImage: startBlob}});
            const {result} = renderHook(() => useOdometerReceiptStitcher(buildArgs({transaction: tx})));
            await act(async () => {
                await Promise.resolve();
            });
            expect(result.current.state.kind).toBe('ready');
            expect(result.current.isReady).toBe(true);
            expect(mockStitchTask).not.toHaveBeenCalled();
            expect(mockSetMoneyRequestReceipt).toHaveBeenCalledWith(TX_ID, 'blob:start', 'start.jpg', true, 'image/jpeg');
        });
    });

    describe('empty derivation', () => {
        it('transitions idle → ready without writing the receipt when transaction has no existing receipt (HI10 guard)', async () => {
            const tx = buildTx();
            const {result} = renderHook(() => useOdometerReceiptStitcher(buildArgs({transaction: tx})));
            await act(async () => {
                await Promise.resolve();
            });
            expect(result.current.state.kind).toBe('ready');
            expect(mockSetMoneyRequestReceipt).not.toHaveBeenCalled();
        });

        it('clears an existing receipt when entering empty derivation', async () => {
            const tx = buildTx({
                comment: {},
                receipt: {source: 'blob:old-receipt', filename: 'old.jpg', type: 'image/jpeg'},
            } as Partial<OnyxTypes.Transaction>);
            renderHook(() => useOdometerReceiptStitcher(buildArgs({transaction: tx})));
            await act(async () => {
                await Promise.resolve();
            });
            expect(mockSetMoneyRequestReceipt).toHaveBeenCalledWith(TX_ID, '', '', true, '');
        });
    });

    describe('stitch mode', () => {
        it('runs stitchTask, transitions stitching → ready, writes the stitched receipt', async () => {
            let resolveStitch: (value: StitchedResult) => void = () => {};
            mockStitchTask.mockReturnValueOnce(
                new Promise<StitchedResult>((resolve) => {
                    resolveStitch = resolve;
                }),
            );
            const tx = buildTx({comment: {odometerStartImage: startBlob, odometerEndImage: endBlob}});
            const {result} = renderHook(() => useOdometerReceiptStitcher(buildArgs({transaction: tx})));
            await act(async () => {
                await Promise.resolve();
            });
            expect(result.current.state.kind).toBe('stitching');
            expect(result.current.isStitching).toBe(true);
            expect(mockStitchTask).toHaveBeenCalledTimes(1);

            await act(async () => {
                resolveStitch(stitchedBlob);
                await Promise.resolve();
            });
            expect(result.current.state.kind).toBe('ready');
            expect(result.current.isReady).toBe(true);
            expect(mockSetMoneyRequestReceipt).toHaveBeenCalledWith(TX_ID, 'blob:stitched', 'stitched.jpg', true, 'image/jpeg');
        });

        it('transitions stitching → error when stitchTask rejects (non-abort)', async () => {
            mockStitchTask.mockRejectedValueOnce(new Error('canvas exploded'));
            const tx = buildTx({comment: {odometerStartImage: startBlob, odometerEndImage: endBlob}});
            const {result} = renderHook(() => useOdometerReceiptStitcher(buildArgs({transaction: tx})));
            await act(async () => {
                await Promise.resolve();
                await Promise.resolve();
            });
            expect(result.current.state.kind).toBe('error');
            expect(result.current.error).toBe('iou.error.stitchOdometerImagesFailed');
        });
    });

    describe('re-render dedupe', () => {
        it('does not re-stitch when re-rendered with the same URIs (idempotent)', async () => {
            mockStitchTask.mockResolvedValue(stitchedBlob);
            const tx = buildTx({comment: {odometerStartImage: startBlob, odometerEndImage: endBlob}});
            const {result, rerender} = renderHook((args: UseOdometerReceiptStitcherArgs) => useOdometerReceiptStitcher(args), {
                initialProps: buildArgs({transaction: tx}),
            });
            await act(async () => {
                await Promise.resolve();
                await Promise.resolve();
            });
            const stitchCallsAfterFirst = mockStitchTask.mock.calls.length;
            const writesAfterFirst = mockSetMoneyRequestReceipt.mock.calls.length;
            expect(result.current.state.kind).toBe('ready');

            // Re-render with a new transaction reference but identical URIs.
            const sameUrisTx = buildTx({comment: {odometerStartImage: {...startBlob}, odometerEndImage: {...endBlob}}});
            rerender(buildArgs({transaction: sameUrisTx}));
            await act(async () => {
                await Promise.resolve();
            });
            expect(mockStitchTask.mock.calls.length).toBe(stitchCallsAfterFirst);
            expect(mockSetMoneyRequestReceipt.mock.calls.length).toBe(writesAfterFirst);
            expect(result.current.state.kind).toBe('ready');
        });

        it('re-stitches when the start image URI changes (Replace flow)', async () => {
            mockStitchTask.mockResolvedValueOnce(stitchedBlob).mockReturnValueOnce(new Promise(() => {}));
            const tx = buildTx({comment: {odometerStartImage: startBlob, odometerEndImage: endBlob}});
            const {result, rerender} = renderHook((args: UseOdometerReceiptStitcherArgs) => useOdometerReceiptStitcher(args), {
                initialProps: buildArgs({transaction: tx}),
            });
            await act(async () => {
                await Promise.resolve();
                await Promise.resolve();
            });
            expect(result.current.state.kind).toBe('ready');

            const newStart: FileObject = {uri: 'blob:start-v2', name: 'start.jpg', type: 'image/jpeg'};
            const updatedTx = buildTx({comment: {odometerStartImage: newStart, odometerEndImage: endBlob}});
            rerender(buildArgs({transaction: updatedTx}));
            await act(async () => {
                await Promise.resolve();
            });
            expect(result.current.state.kind).toBe('stitching');
            if (result.current.state.kind === 'stitching') {
                expect(result.current.state.derivationKey).toBe('blob:start-v2|blob:end');
            }
            expect(mockStitchTask.mock.calls.length).toBe(2);
        });

        it('error state is sticky for the same failing URIs (no infinite retry loop)', async () => {
            mockStitchTask.mockRejectedValueOnce(new Error('canvas exploded'));
            const tx = buildTx({comment: {odometerStartImage: startBlob, odometerEndImage: endBlob}});
            const {result, rerender} = renderHook((args: UseOdometerReceiptStitcherArgs) => useOdometerReceiptStitcher(args), {
                initialProps: buildArgs({transaction: tx}),
            });
            await act(async () => {
                await Promise.resolve();
                await Promise.resolve();
            });
            expect(result.current.state.kind).toBe('error');
            const stitchCallsAfterError = mockStitchTask.mock.calls.length;

            // Re-render with same URIs — should NOT retry.
            const sameUrisTx = buildTx({comment: {odometerStartImage: {...startBlob}, odometerEndImage: {...endBlob}}});
            rerender(buildArgs({transaction: sameUrisTx}));
            await act(async () => {
                await Promise.resolve();
            });
            expect(mockStitchTask.mock.calls.length).toBe(stitchCallsAfterError);
            expect(result.current.state.kind).toBe('error');
        });
    });

    describe('unmount', () => {
        it('aborts in-flight stitch on unmount', async () => {
            let observedSignal: AbortSignal | undefined;
            let resolveStitch: ((value: StitchedResult) => void) | undefined;
            mockStitchTask.mockImplementation((args: unknown) => {
                observedSignal = (args as {signal: AbortSignal}).signal;
                return new Promise<StitchedResult>((resolve) => {
                    resolveStitch = resolve;
                });
            });
            const tx = buildTx({comment: {odometerStartImage: startBlob, odometerEndImage: endBlob}});
            const {unmount} = renderHook(() => useOdometerReceiptStitcher(buildArgs({transaction: tx})));
            await act(async () => {
                await Promise.resolve();
            });
            expect(observedSignal?.aborted).toBe(false);

            unmount();
            expect(observedSignal?.aborted).toBe(true);

            // Resolving the in-flight stitch after unmount should NOT write the receipt.
            const writesBefore = mockSetMoneyRequestReceipt.mock.calls.length;
            await act(async () => {
                resolveStitch?.(stitchedBlob);
                await Promise.resolve();
            });
            expect(mockSetMoneyRequestReceipt.mock.calls.length).toBe(writesBefore);
        });
    });

    describe('verifier composition', () => {
        it('passes transaction undefined to verifier when not an odometer flow (verifier bails internally)', () => {
            renderHook(() => useOdometerReceiptStitcher(buildArgs({isOdometerDistanceRequest: false, transaction: buildTx()})));
            const args = mockUseRestartOnOdometerImagesFailure.mock.calls.at(0);
            expect(args?.at(0)).toBeUndefined();
        });

        it('forwards onBackupHandled to the verifier (not invoked by the stitcher itself)', () => {
            const onBackupHandled = jest.fn();
            renderHook(() => useOdometerReceiptStitcher(buildArgs({onBackupHandled})));
            const args = mockUseRestartOnOdometerImagesFailure.mock.calls.at(0);
            // 5th positional argument is the callback.
            expect(args?.at(4)).toBe(onBackupHandled);
        });

        it('forwards hasVerifiedBlobs verbatim from the verifier to consumers', () => {
            setVerifierResult({hasVerifiedBlobs: false});
            const {result} = renderHook(() => useOdometerReceiptStitcher(buildArgs()));
            expect(result.current.hasVerifiedBlobs).toBe(false);
        });
    });
});
