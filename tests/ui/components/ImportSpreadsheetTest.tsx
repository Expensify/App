import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import Button from '@components/Button';
import type DragAndDropConsumerProps from '@components/DragAndDrop/Consumer/types';
import type {DragAndDropProviderProps} from '@components/DragAndDrop/Provider/types';
import type FilePickerProps from '@components/FilePicker/types';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import ImageSVG from '@components/ImageSVG';
import ImportSpreadsheet from '@components/ImportSpreadsheet';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import type ScreenWrapper from '@components/ScreenWrapper';
import type {ScreenWrapperChildrenProps} from '@components/ScreenWrapper';

import type useConfirmModal from '@hooks/useConfirmModal';

import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ImportedSpreadsheet} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

import type RNFS from 'react-native-fs';

import React from 'react';
import {PixelRatio, Platform, View} from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import Onyx from 'react-native-onyx';
import * as XLSX from 'xlsx';

import type * as MockFixture from '../../utils/createMock';

import createMock from '../../utils/createMock';
import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

type SpreadsheetPicker = Parameters<FilePickerProps['children']>[0]['openPicker'];

const mockScreenWrapperContext = createMock<ScreenWrapperChildrenProps>({safeAreaPaddingBottomStyle: {}});
const mockOpenPicker = jest.fn<ReturnType<SpreadsheetPicker>, Parameters<SpreadsheetPicker>>();
const mockShowConfirmModal = jest.fn<ReturnType<ReturnType<typeof useConfirmModal>['showConfirmModal']>, Parameters<ReturnType<typeof useConfirmModal>['showConfirmModal']>>();
const mockCreateObjectURL = jest.fn<ReturnType<typeof URL.createObjectURL>, Parameters<typeof URL.createObjectURL>>();
const originalCreateObjectURL = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
let spreadsheetConnection: ReturnType<typeof Onyx.connect> | undefined;
let mockDropProps: DragAndDropConsumerProps | undefined;
let mockSpreadsheet: ImportedSpreadsheet | null | undefined;

// The native filesystem mock supplies the same sandbox directory as the merged RNFS fixture.
jest.mock('react-native-blob-util', () => {
    const {default: createMockFixture} = jest.requireActual<typeof MockFixture>('../../utils/createMock');
    const filesystem = jest.requireMock<typeof RNFS>('react-native-fs');
    return {
        __esModule: true,
        default: createMockFixture<typeof RNFetchBlob>({
            fs: createMockFixture<typeof RNFetchBlob.fs>({
                dirs: createMockFixture<typeof RNFetchBlob.fs.dirs>({DocumentDir: filesystem.DocumentDirectoryPath}),
            }),
        }),
    };
});

jest.mock('@hooks/useConfirmModal', () => ({__esModule: true, default: () => ({showConfirmModal: mockShowConfirmModal})}));
jest.mock('@hooks/useResponsiveLayout');
jest.mock('@components/FilePicker', () => ({__esModule: true, default: ({children}: FilePickerProps) => children({openPicker: mockOpenPicker})}));
jest.mock('@components/DragAndDrop/Provider', () => ({__esModule: true, default: ({children}: DragAndDropProviderProps) => children}));
jest.mock('@components/DragAndDrop/Consumer', () => ({
    __esModule: true,
    default: (props: DragAndDropConsumerProps) => {
        mockDropProps = props;
        return props.children;
    },
}));
jest.mock('@components/ScreenWrapper', () => ({
    __esModule: true,
    default: ({children}: React.ComponentProps<typeof ScreenWrapper>) => (typeof children === 'function' ? children(mockScreenWrapperContext) : children),
}));
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@libs/Navigation/Navigation');
jest.mock('@components/ConfirmedRoute.tsx');

const DESTINATION = ROUTES.HOME;

async function pickSpreadsheet(file: FileObject) {
    fireEvent.press(screen.getByLabelText(translateLocal('common.chooseFile')));
    const options = mockOpenPicker.mock.calls.at(-1)?.[0];
    expect(options).toBeDefined();
    await act(async () => options?.onPicked(file));
    await waitForBatchedUpdatesWithAct();
}

describe('ImportSpreadsheet picker, parser and action', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        Object.defineProperty(URL, 'createObjectURL', {configurable: true, value: mockCreateObjectURL});
    });
    afterAll(() => {
        if (originalCreateObjectURL) {
            Object.defineProperty(URL, 'createObjectURL', originalCreateObjectURL);
        } else {
            Reflect.deleteProperty(URL, 'createObjectURL');
        }
    });
    beforeEach(async () => {
        jest.clearAllMocks();
        mockSpreadsheet = undefined;
        mockDropProps = undefined;
        await Onyx.clear();
        spreadsheetConnection = Onyx.connect({
            key: ONYXKEYS.IMPORTED_SPREADSHEET,
            callback: (value) => {
                mockSpreadsheet = value;
            },
        });
    });
    afterEach(() => {
        jest.restoreAllMocks();
        if (spreadsheetConnection !== undefined) {
            Onyx.disconnect(spreadsheetConnection);
        }
    });

    it('keeps CSV dates raw and forwards absent native MIME metadata through the real action', async () => {
        // Given the native picker descriptor and CSV text producer with a date that must remain unparsed.
        const csv = 'Date,Amount,Approved\n02/03/2026,12.50,true\n';
        jest.spyOn(globalThis, 'fetch').mockResolvedValue(createMock<Response>({text: async () => csv}));
        const file: FileObject = {uri: 'file:///spreadsheet.csv', name: 'spreadsheet.csv', size: csv.length};
        render(
            <LocaleContextProvider>
                <HTMLEngineProvider>
                    <ImportSpreadsheet
                        goTo={DESTINATION}
                        shouldForceReplaceNavigation
                    />
                </HTMLEngineProvider>
            </LocaleContextProvider>,
        );
        // When the real picker callback, SheetJS parser and action execute.
        await pickSpreadsheet(file);
        await waitFor(() => expect(Navigation.navigate).toHaveBeenCalledWith(DESTINATION, {forceReplace: true}));
        // Then dates and MIME absence survive in the actual Onyx result rather than a mocked action argument.
        expect(mockSpreadsheet).toBeDefined();
        expect(mockSpreadsheet?.data).toEqual([
            ['Date', '02/03/2026'],
            ['Amount', '12.50'],
            ['Approved', 'true'],
        ]);
        expect(mockSpreadsheet?.fileType).toBeUndefined();
        expect(mockSpreadsheet?.fileName).toBe('spreadsheet.csv');
        expect(mockSpreadsheet?.fileURI).toBe(file.uri);
    });

    it('reads binary workbook dates locally and preserves sparse and mixed cells', async () => {
        // Given an actual SheetJS workbook producer. Run this case under UTC and Asia/Kolkata to distinguish local midnight from UTC.
        const date = new Date(2026, 0, 2);
        const worksheet = XLSX.utils.aoa_to_sheet(
            [
                ['Date', 'Amount', 'Approved', 'Missing'],
                [date, 42, true, null],
                [null, 'plain', false, 'tail'],
            ],
            {cellDates: true},
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Import');
        const bytes: unknown = XLSX.write(workbook, {bookType: 'xlsx', type: 'array', cellDates: true});
        if (!(bytes instanceof ArrayBuffer)) {
            throw new Error('SheetJS array output did not produce an ArrayBuffer');
        }
        jest.spyOn(globalThis, 'fetch').mockResolvedValue(createMock<Response>({arrayBuffer: async () => bytes}));
        const file: FileObject = {
            uri: 'file:///spreadsheet.xlsx',
            name: 'spreadsheet.xlsx',
            size: bytes.byteLength,
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
        render(
            <LocaleContextProvider>
                <HTMLEngineProvider>
                    <ImportSpreadsheet goTo={DESTINATION} />
                </HTMLEngineProvider>
            </LocaleContextProvider>,
        );
        // When real binary parsing enables cellDates and the production action stores the converted rows.
        await pickSpreadsheet(file);
        await waitFor(() => expect(Navigation.navigate).toHaveBeenCalled());
        // Then local dates, primitive conversion and sparse row positions remain meaningful.
        expect(mockSpreadsheet).toBeDefined();
        expect(mockSpreadsheet?.data).toEqual([
            ['Date', '2026-01-02', ''],
            ['Amount', '42', 'plain'],
            ['Approved', 'true', 'false'],
            ['Missing', '', 'tail'],
        ]);
        expect(mockSpreadsheet?.fileType).toBe(file.type);
    });

    it('uses Blob provenance for a web file and executes the real drop callback', async () => {
        // Given the browser File producer and a CSV body.
        const file = new File(['Name,Value\nAlice,7'], 'dropped.csv', {type: 'text/csv'});
        mockCreateObjectURL.mockReturnValue('blob:dropped-spreadsheet');
        jest.spyOn(globalThis, 'fetch').mockResolvedValue(createMock<Response>({text: async () => 'Name,Value\nAlice,7'}));
        render(
            <LocaleContextProvider>
                <HTMLEngineProvider>
                    <ImportSpreadsheet goTo={DESTINATION} />
                </HTMLEngineProvider>
            </LocaleContextProvider>,
        );
        const drop = mockDropProps?.onDrop;
        expect(drop).toBeDefined();
        // When the real drop handler receives the browser-produced file through its file-list boundary.
        await act(async () => drop?.(createMock<DragEvent>({dataTransfer: {files: createMock<FileList>([file])}})));
        await waitFor(() => expect(Navigation.navigate).toHaveBeenCalled());
        // Then the file reaches the real parser and action using its browser object URL.
        expect(mockCreateObjectURL).toHaveBeenCalledWith(file);
        expect(mockSpreadsheet).toBeDefined();
        expect(mockSpreadsheet?.data).toEqual([
            ['Name', 'Alice'],
            ['Value', '7'],
        ]);
        expect(mockSpreadsheet?.fileURI).toBe('blob:dropped-spreadsheet');
    });

    it('bypasses spreadsheet parsing for OFX and retains the picker object identity', async () => {
        // Given a bank-statement picker descriptor handled by the statement upload seam.
        const file: FileObject = {name: 'statement.OFX', uri: 'file:///statement.OFX', size: 20};
        const onStatementPicked = jest.fn<Promise<void>, [FileObject]>().mockResolvedValue();
        const fetchSpy = jest.spyOn(globalThis, 'fetch');
        render(
            <LocaleContextProvider>
                <HTMLEngineProvider>
                    <ImportSpreadsheet
                        goTo={DESTINATION}
                        shouldAllowBankStatements
                        onStatementPicked={onStatementPicked}
                    />
                </HTMLEngineProvider>
            </LocaleContextProvider>,
        );
        // When the statement branch is selected using its existing case-insensitive validation.
        await pickSpreadsheet(file);
        // Then no workbook or navigation is produced, and the original file reaches upload once.
        expect(onStatementPicked).toHaveBeenCalledTimes(1);
        expect(onStatementPicked).toHaveBeenCalledWith(file);
        expect(fetchSpy).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('rewrites iOS document URIs while preserving the native descriptor and MIME absence', async () => {
        // Given a native iOS picker URI whose Documents prefix differs from the current app sandbox.
        jest.replaceProperty(Platform, 'OS', 'ios');
        const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(createMock<Response>({text: async () => 'Name,Value\nAlice,1'}));
        render(
            <LocaleContextProvider>
                <HTMLEngineProvider>
                    <ImportSpreadsheet goTo={DESTINATION} />
                </HTMLEngineProvider>
            </LocaleContextProvider>,
        );
        // When the actual picker callback reads the descriptor through the iOS rewrite branch.
        await pickSpreadsheet({name: 'native.csv', uri: 'file:///old-container/Documents/native.csv', size: 20});
        await waitFor(() => expect(Navigation.navigate).toHaveBeenCalled());
        // Then fetch and the stored URI use the producer's current DocumentDir and never create a browser object URL.
        expect(fetchSpy).toHaveBeenCalledWith(`${RNFetchBlob.fs.dirs.DocumentDir}/native.csv`);
        expect(mockSpreadsheet?.fileURI).toBe(`${RNFetchBlob.fs.dirs.DocumentDir}/native.csv`);
        expect(mockSpreadsheet?.fileType).toBeUndefined();
        expect(mockCreateObjectURL).not.toHaveBeenCalled();
    });

    it('shows parse errors and clears loading instead of navigating on an invalid workbook', async () => {
        // Given a supported file whose parsed contents cannot satisfy the real action's two-row minimum.
        jest.spyOn(globalThis, 'fetch').mockResolvedValue(createMock<Response>({text: async () => 'Only a header'}));
        render(
            <LocaleContextProvider>
                <HTMLEngineProvider>
                    <ImportSpreadsheet goTo={DESTINATION} />
                </HTMLEngineProvider>
            </LocaleContextProvider>,
        );
        // When the real parser and action reject the file.
        await pickSpreadsheet({name: 'invalid.csv', uri: 'file:///invalid.csv', size: 10});
        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalled());
        // Then the error remains visible and the picker can be used again without a navigation.
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(screen.UNSAFE_getByType(Button).props.isLoading).toBe(false);
    });

    it('uses web top rather than y and ignores layout without the web contribution', () => {
        // Given the actual layout container and distinct web top/y coordinates.
        render(
            <LocaleContextProvider>
                <HTMLEngineProvider>
                    <ImportSpreadsheet goTo={DESTINATION} />
                </HTMLEngineProvider>
            </LocaleContextProvider>,
        );
        const layoutView = screen.UNSAFE_getAllByType(View).find((view) => view.props.onLayout);
        expect(layoutView).toBeDefined();
        const overlay = screen.UNSAFE_getAllByType(ImageSVG).at(-1)?.parent;
        expect(overlay).toBeDefined();
        // When react-native-web contributes top, followed by a native layout containing only y.
        if (!layoutView) {
            throw new Error('Spreadsheet layout container is missing');
        }
        fireEvent(layoutView, 'layout', {nativeEvent: {layout: {top: 31, y: 97, x: 0, width: 10, height: 10}}});
        expect(overlay?.props.style).toEqual(expect.arrayContaining([expect.objectContaining({top: PixelRatio.roundToNearestPixel(31)})]));
        fireEvent(layoutView, 'layout', {nativeEvent: {layout: {y: 97, x: 0, width: 10, height: 10}}});
        // Then the saved overlay position comes from top and remains unchanged when top is absent.
        expect(overlay?.props.style).toEqual(expect.arrayContaining([expect.objectContaining({top: PixelRatio.roundToNearestPixel(31)})]));
    });
});
