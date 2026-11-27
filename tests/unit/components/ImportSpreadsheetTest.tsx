import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ImportSpreadsheet from '@components/ImportSpreadsheet';

import {setSpreadsheetData} from '@libs/actions/ImportSpreadsheet';
import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';
import type {FileObject} from '@src/types/utils/Attachment';

import React from 'react';
import * as XLSX from 'xlsx';

let mockPickedFile: FileObject;

// Keep the real parser while sharing its read spy with the component's dynamic import.
jest.mock('xlsx', () => ({__esModule: true, ...jest.requireActual<typeof XLSX>('xlsx')}));
jest.mock('react-native-blob-util', () => ({fs: {dirs: {DocumentDir: '/Documents'}}}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useConfirmModal', () => () => ({showConfirmModal: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
jest.mock('@libs/actions/ImportSpreadsheet', () => ({setSpreadsheetData: jest.fn(() => Promise.resolve())}));
jest.mock('@libs/actions/Policy/Tag', () => ({setImportedSpreadsheetIsImportingMultiLevelTags: jest.fn()}));
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@components/ImageSVG', () => () => null);
jest.mock('@components/RenderHTML', () => () => null);
jest.mock('@components/DragAndDrop/Consumer', () => () => null);
jest.mock(
    '@components/DragAndDrop/Provider',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: (props: {safeAreaPaddingBottomStyle: undefined}) => React.ReactNode}) =>
            children({safeAreaPaddingBottomStyle: undefined}),
);
jest.mock(
    '@components/ScrollView',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/FilePicker',
    () =>
        ({children}: {children: (props: {openPicker: (options: {onPicked: (file: FileObject) => void}) => void}) => React.ReactNode}) =>
            children({openPicker: ({onPicked}) => onPicked(mockPickedFile)}),
);

describe('ImportSpreadsheet file parsing', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    it.each([false, true])('imports the first worksheet without parsing unused worksheets (hidden: %s)', async (isFirstSheetHidden) => {
        // Given an import sheet with typed values and an unrelated sheet that must not add parsing work.
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
            workbook,
            XLSX.utils.aoa_to_sheet([
                ['Category', 'Date', 'Amount', 'Enabled'],
                ['Travel', new Date(2026, 0, 15), 42, true],
            ]),
            'Import',
        );
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['Unused'], ['Reference data']]), 'Reference');
        if (isFirstSheetHidden) {
            XLSX.utils.book_set_sheet_visibility(workbook, 'Import', 1);
        }
        const buffer: unknown = XLSX.write(workbook, {type: 'array', bookType: 'xlsx'});
        if (!(buffer instanceof ArrayBuffer)) {
            throw new Error('Expected a binary workbook');
        }
        mockPickedFile = {name: 'categories.xlsx', uri: 'file://categories.xlsx', size: buffer.byteLength};
        jest.spyOn(globalThis, 'fetch').mockImplementation(jest.fn().mockResolvedValue({arrayBuffer: () => Promise.resolve(buffer)}));
        const readWorkbook = XLSX.read;
        let parsedWorkbook: XLSX.WorkBook | undefined;
        const readSpy = jest.spyOn(XLSX, 'read').mockImplementation((data: unknown, options) => {
            parsedWorkbook = readWorkbook(data, options);
            return parsedWorkbook;
        });

        // When the user selects the workbook through the component's normal file picker.
        render(<ImportSpreadsheet goTo={ROUTES.HOME} />);
        fireEvent.press(screen.getByLabelText('common.chooseFile'));
        await waitFor(() => expect(Navigation.navigate).toHaveBeenCalled());

        // Then the real parser skips the unused sheet and the mapping data retains first-sheet values and date formatting.
        expect(readSpy).toHaveBeenCalledTimes(1);
        expect(Object.keys(parsedWorkbook?.Sheets ?? {})).toEqual(['Import']);
        expect(setSpreadsheetData).toHaveBeenCalledWith(
            [
                ['Category', 'Date', 'Amount', 'Enabled'],
                ['Travel', '2026-01-15', '42', 'true'],
            ],
            mockPickedFile.uri,
            undefined,
            mockPickedFile.name,
            false,
            undefined,
            undefined,
        );
    });

    it('preserves literal dates and leading zeros in CSV imports', async () => {
        // Given CSV values that would change if the binary workbook date conversion were applied to text imports.
        mockPickedFile = {name: 'categories.csv', uri: 'file://categories.csv', size: 1};
        jest.spyOn(globalThis, 'fetch').mockImplementation(jest.fn().mockResolvedValue({text: () => Promise.resolve('Category,Date,Code\nTravel,01/02/2026,00123')}));

        // When the same import component reads a CSV file.
        render(<ImportSpreadsheet goTo={ROUTES.HOME} />);
        fireEvent.press(screen.getByLabelText('common.chooseFile'));
        await waitFor(() => expect(Navigation.navigate).toHaveBeenCalled());

        // Then text values reach the mapping screen unchanged.
        expect(setSpreadsheetData).toHaveBeenCalledWith(
            [
                ['Category', 'Date', 'Code'],
                ['Travel', '01/02/2026', '00123'],
            ],
            mockPickedFile.uri,
            undefined,
            mockPickedFile.name,
            false,
            undefined,
            undefined,
        );
    });
});
