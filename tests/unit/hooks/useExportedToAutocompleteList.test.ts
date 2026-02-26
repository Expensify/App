import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useExportedToAutocompleteList from '@hooks/useExportedToAutocompleteList';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ExportTemplate} from '@src/types/onyx';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const mockTranslate = jest.fn((key: string) => key);
const mockGetExportTemplates = jest.fn();

jest.mock('@hooks/useLocalize', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({translate: mockTranslate}),
}));

jest.mock('@libs/actions/Search', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getExportTemplates: (...args: unknown[]) => mockGetExportTemplates(...args),
}));

describe('useExportedToAutocompleteList', () => {
    const predefinedNames = CONST.POLICY.CONNECTIONS.EXPORTED_TO_INTEGRATION_DISPLAY_NAMES;
    const expenseLevelLabel = CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT;
    const reportLevelLabel = CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
        mockGetExportTemplates.mockReturnValue([]);
    });

    it('returns predefined integration names and standard labels for default templates', () => {
        mockGetExportTemplates.mockReturnValue([
            {templateName: CONST.REPORT.EXPORT_OPTIONS.EXPENSE_LEVEL_EXPORT, name: expenseLevelLabel} as ExportTemplate,
            {templateName: CONST.REPORT.EXPORT_OPTIONS.REPORT_LEVEL_EXPORT, name: reportLevelLabel} as ExportTemplate,
        ]);

        const {result} = renderHook(() => useExportedToAutocompleteList());

        expect(result.current).toEqual(expect.arrayContaining(predefinedNames));
        expect(result.current).toContain(expenseLevelLabel);
        expect(result.current).toContain(reportLevelLabel);
    });

    it('passes empty array and object to getExportTemplates when Onyx is undefined', () => {
        renderHook(() => useExportedToAutocompleteList());

        expect(mockGetExportTemplates).toHaveBeenCalledWith([], {}, mockTranslate, undefined, true);
    });

    it('includes standard template display name for expense level template', () => {
        mockGetExportTemplates.mockReturnValue([{templateName: CONST.REPORT.EXPORT_OPTIONS.EXPENSE_LEVEL_EXPORT, name: 'Expense Level'} as ExportTemplate]);

        const {result} = renderHook(() => useExportedToAutocompleteList());

        expect(result.current).toContain(expenseLevelLabel);
        expect(result.current).toEqual(expect.arrayContaining([...predefinedNames, expenseLevelLabel]));
    });

    it('includes custom template name when template has no standard mapping', () => {
        const customTemplateName = 'Custom Export Layout';
        mockGetExportTemplates.mockReturnValue([{templateName: customTemplateName, name: customTemplateName} as ExportTemplate]);

        const {result} = renderHook(() => useExportedToAutocompleteList());

        expect(result.current).toContain(customTemplateName);
        expect(result.current).toEqual(expect.arrayContaining([...predefinedNames, customTemplateName]));
    });

    it('filters out empty template names', () => {
        mockGetExportTemplates.mockReturnValue([{templateName: '', name: 'Empty'} as ExportTemplate, {templateName: 'ValidTemplate', name: 'Valid'} as ExportTemplate]);

        const {result} = renderHook(() => useExportedToAutocompleteList());

        expect(result.current).not.toContain('');
        expect(result.current).toContain('ValidTemplate');
    });

    it('returns predefined integration name once when matches it', () => {
        const quickBooksDisplayName = 'QuickBooks Online';
        mockGetExportTemplates.mockReturnValue([{templateName: 'quickbooksOnline', name: quickBooksDisplayName} as ExportTemplate]);

        const {result} = renderHook(() => useExportedToAutocompleteList());

        const count = result.current.filter((item) => item === quickBooksDisplayName).length;
        expect(count).toBe(1);
        expect(result.current).toContain(quickBooksDisplayName);
    });

    it('returns each custom name once when templates repeat', () => {
        mockGetExportTemplates.mockReturnValue([{templateName: 'Duplicate', name: 'Duplicate'} as ExportTemplate, {templateName: 'Duplicate', name: 'Duplicate'} as ExportTemplate]);

        const {result} = renderHook(() => useExportedToAutocompleteList());

        const count = result.current.filter((item) => item === 'Duplicate').length;
        expect(count).toBe(1);
    });

    it('includes standard and custom template names together', () => {
        const customName = 'Custom CSV Layout';
        mockGetExportTemplates.mockReturnValue([
            {templateName: CONST.REPORT.EXPORT_OPTIONS.REPORT_LEVEL_EXPORT, name: reportLevelLabel} as ExportTemplate,
            {templateName: customName, name: customName} as ExportTemplate,
        ]);

        const {result} = renderHook(() => useExportedToAutocompleteList());

        expect(result.current).toContain(reportLevelLabel);
        expect(result.current).toContain(customName);
        expect(result.current).toEqual(expect.arrayContaining([...predefinedNames, reportLevelLabel, customName]));
    });

    it('returns same array reference on rerender when deps unchanged', () => {
        mockGetExportTemplates.mockReturnValue([]);

        const {result, rerender} = renderHook(() => useExportedToAutocompleteList());
        const firstResult = result.current;
        rerender({});
        const secondResult = result.current;

        expect(firstResult).toBe(secondResult);
    });
});
