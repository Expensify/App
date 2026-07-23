/* eslint-disable @typescript-eslint/naming-convention -- ARIA attributes are kebab-case by spec. */
import * as tableAccessibilityModule from '@components/Table/tableAccessibility';

import CONST from '@src/CONST';

type TableAccessibilityModule = typeof tableAccessibilityModule;

// `tableAccessibility` reads the platform once, at module load, to decide whether ARIA table semantics apply.
// Requiring the module through `loadModule` (below) lets each test evaluate it against a specific platform.
let mockedPlatform: string;
jest.mock('@libs/getPlatform', () => ({
    __esModule: true,
    default: () => mockedPlatform,
}));

function loadModule(platform: string): TableAccessibilityModule {
    mockedPlatform = platform;
    let module: TableAccessibilityModule = tableAccessibilityModule;
    jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        module = require('@components/Table/tableAccessibility');
    });
    return module;
}

// The pure prop builders are platform-independent, so any platform works when loading them.
const {getTableContainerAccessibilityProps, getRowGroupAccessibilityProps, getRowAccessibilityProps, getColumnHeaderAccessibilityProps, getCellAccessibilityProps} = loadModule(
    CONST.PLATFORM.WEB,
);

describe('tableAccessibility', () => {
    describe('shouldUseTableSemantics', () => {
        it('enables semantics on desktop web in the wide layout', () => {
            const {shouldUseTableSemantics} = loadModule(CONST.PLATFORM.WEB);
            expect(shouldUseTableSemantics(false)).toBe(true);
        });

        it('disables semantics on desktop web in the narrow layout', () => {
            const {shouldUseTableSemantics} = loadModule(CONST.PLATFORM.WEB);
            expect(shouldUseTableSemantics(true)).toBe(false);
        });

        it('disables semantics on mobile web', () => {
            const {shouldUseTableSemantics} = loadModule(CONST.PLATFORM.MOBILE_WEB);
            expect(shouldUseTableSemantics(false)).toBe(false);
        });

        it('disables semantics on native platforms', () => {
            expect(loadModule(CONST.PLATFORM.IOS).shouldUseTableSemantics(false)).toBe(false);
            expect(loadModule(CONST.PLATFORM.ANDROID).shouldUseTableSemantics(false)).toBe(false);
        });
    });

    describe('getTableContainerAccessibilityProps', () => {
        it('returns no props when disabled', () => {
            expect(getTableContainerAccessibilityProps(false, 'Members', 3, 4)).toEqual({});
        });

        it('exposes the table role, label and counts, reserving one extra row for the header', () => {
            expect(getTableContainerAccessibilityProps(true, 'Members', 3, 4)).toEqual({
                role: CONST.ROLE.TABLE,
                'aria-label': 'Members',
                'aria-rowcount': 4,
                'aria-colcount': 4,
            });
        });
    });

    describe('getRowGroupAccessibilityProps', () => {
        it('returns no props when disabled', () => {
            expect(getRowGroupAccessibilityProps(false)).toEqual({});
        });

        it('exposes the rowgroup role when enabled', () => {
            expect(getRowGroupAccessibilityProps(true)).toEqual({role: CONST.ROLE.ROWGROUP});
        });
    });

    describe('getRowAccessibilityProps', () => {
        it('returns no props when disabled', () => {
            expect(getRowAccessibilityProps(false, 0)).toEqual({});
        });

        it('pins the header row to the 1-based index 1', () => {
            expect(getRowAccessibilityProps(true, 0, true)).toEqual({
                role: CONST.ROLE.ROW,
                'aria-rowindex': 1,
            });
        });

        it('offsets data rows past the header so the first data row is index 2', () => {
            expect(getRowAccessibilityProps(true, 0)).toEqual({
                role: CONST.ROLE.ROW,
                'aria-rowindex': 2,
            });
            expect(getRowAccessibilityProps(true, 5)['aria-rowindex']).toBe(7);
        });
    });

    describe('getColumnHeaderAccessibilityProps', () => {
        it('returns no props when disabled', () => {
            expect(getColumnHeaderAccessibilityProps(false, true, true, 'asc')).toEqual({});
        });

        it('omits aria-sort for non-sortable columns', () => {
            expect(getColumnHeaderAccessibilityProps(true, false, false, 'asc')).toEqual({role: CONST.ROLE.COLUMNHEADER});
        });

        it('allows omitting the sort order for non-sortable headers (e.g. the select-all corner)', () => {
            expect(getColumnHeaderAccessibilityProps(true, false, false)).toEqual({role: CONST.ROLE.COLUMNHEADER});
        });

        it('reports a sortable but inactive column as unsorted', () => {
            expect(getColumnHeaderAccessibilityProps(true, true, false, 'asc')).toEqual({
                role: CONST.ROLE.COLUMNHEADER,
                'aria-sort': 'none',
            });
        });

        it('maps the active sort order to the matching aria-sort value', () => {
            expect(getColumnHeaderAccessibilityProps(true, true, true, 'asc')['aria-sort']).toBe('ascending');
            expect(getColumnHeaderAccessibilityProps(true, true, true, 'desc')['aria-sort']).toBe('descending');
        });
    });

    describe('getCellAccessibilityProps', () => {
        it('returns no props when disabled', () => {
            expect(getCellAccessibilityProps(false)).toEqual({});
        });

        it('exposes the cell role when enabled', () => {
            expect(getCellAccessibilityProps(true)).toEqual({role: CONST.ROLE.CELL});
        });
    });
});
