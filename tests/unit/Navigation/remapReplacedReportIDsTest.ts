import remapReplacedReportIDs from '@libs/Navigation/helpers/remapReplacedReportIDs';
import {registerReportReplacement, resolveReplacementReportID} from '@libs/Navigation/helpers/reportReplacementMapping';

import SCREENS from '@src/SCREENS';

import {CommonActions} from '@react-navigation/native';

describe('remapReplacedReportIDs', () => {
    it('repairs Details and the underlying report restored by browser Forward without changing the saved entry', () => {
        // Given Details was saved in browser history before its optimistic report was replaced
        const savedState = {
            index: 1,
            routes: [
                {key: 'workspace', name: SCREENS.REPORT, params: {reportID: '300'}},
                {
                    key: 'modal',
                    name: 'ModalNavigator',
                    state: {
                        index: 1,
                        routes: [
                            {key: 'expense', name: SCREENS.RIGHT_MODAL.EXPENSE_REPORT, params: {reportID: '1100', backTo: '/r/300'}},
                            {
                                key: 'details',
                                name: SCREENS.REPORT_DETAILS.DYNAMIC_ROOT,
                                params: {reportID: '1100', backTo: '/e/1100?backTo=%2Fr%2F300'},
                                path: '/details?reportID=1100&backTo=%2Fe%2F1100',
                            },
                        ],
                    },
                },
            ],
        };
        const action = CommonActions.reset(savedState);
        registerReportReplacement('1100', '1200');

        // When Forward restores that entry after reconnection
        const result = remapReplacedReportIDs(action);

        // Then both panels reference the survivor, preserving focus, keys, and the original history snapshot
        expect(result).toEqual(
            CommonActions.reset({
                ...savedState,
                routes: [
                    savedState.routes[0],
                    {
                        ...savedState.routes[1],
                        state: {
                            index: 1,
                            routes: [
                                {key: 'expense', name: SCREENS.RIGHT_MODAL.EXPENSE_REPORT, params: {reportID: '1200', backTo: '/r/300'}},
                                {
                                    key: 'details',
                                    name: SCREENS.REPORT_DETAILS.DYNAMIC_ROOT,
                                    params: {reportID: '1200', backTo: '/e/1200?backTo=%2Fr%2F300'},
                                    path: '/details?reportID=1200&backTo=%2Fe%2F1200',
                                },
                            ],
                        },
                    },
                ],
            }),
        );
        expect(savedState.routes[1]?.state?.routes[1]?.params.reportID).toBe('1100');
        expect(action.payload).toBe(savedState);
        expect(remapReplacedReportIDs(action)).toEqual(result);
        expect(remapReplacedReportIDs(result)).toBe(result);
    });

    it('resolves replacement chains to the final report in parameters and encoded return paths', () => {
        // Given a report was replaced twice while an older history entry still referenced the original ID
        registerReportReplacement('2100', '2200');
        registerReportReplacement('2200', '2300');
        const action = CommonActions.reset({
            routes: [{name: SCREENS.REPORT_DETAILS.DYNAMIC_ROOT, params: {reportID: '2100', backTo: '/search/view/2200?backTo=%2Fe%2F2100'}}],
        });

        // When browser navigation restores the original entry
        const result = remapReplacedReportIDs(action);

        // Then both old IDs resolve to the final survivor
        expect(result).toEqual(
            CommonActions.reset({
                routes: [{name: SCREENS.REPORT_DETAILS.DYNAMIC_ROOT, params: {reportID: '2300', backTo: '/search/view/2300?backTo=%2Fe%2F2300'}}],
            }),
        );
    });

    it('preserves unrelated reports, similarly prefixed IDs, and non-report parameters', () => {
        // Given only report 3100 was replaced, not another ID beginning with the same digits
        registerReportReplacement('3100', '3200');
        const action = CommonActions.reset({
            routes: [{name: SCREENS.REPORT, params: {reportID: '31000', backTo: '/e/31000'}}, {name: 'UnrelatedScreen', params: {accountID: '3100', label: '3100'}}, {name: 'NoParams'}],
        });

        // When the saved state is checked
        const result = remapReplacedReportIDs(action);

        // Then no unrelated state changes, including object identity
        expect(result).toBe(action);
    });

    it('leaves non-RESET navigation actions unchanged', () => {
        // Given an ordinary navigation action contains an old report ID
        registerReportReplacement('4100', '4200');
        const action = CommonActions.navigate(SCREENS.REPORT, {reportID: '4100'});

        // When it passes through the history RESET sanitizer
        const result = remapReplacedReportIDs(action);

        // Then normal navigation handling is not intercepted
        expect(result).toBe(action);
    });

    it('ignores identity and cyclic replacements', () => {
        // Given a confirmed replacement already points from the old report to the survivor
        registerReportReplacement('5100', '5200');

        // When redundant or reversed replacements are registered
        registerReportReplacement('5200', '5200');
        registerReportReplacement('5200', '5100');

        // Then the original mapping remains usable without forming a cycle
        expect(resolveReplacementReportID('5100')).toBe('5200');
        expect(resolveReplacementReportID('5200')).toBe('5200');
    });

    it('repairs the report ID even if the saved return path contains malformed encoding', () => {
        // Given a stale Details entry has a return path that cannot be decoded
        registerReportReplacement('7100', '7200');
        const action = CommonActions.reset({
            routes: [{name: SCREENS.REPORT_DETAILS.DYNAMIC_ROOT, params: {reportID: '7100', backTo: '/e/7100?backTo=%invalid'}}],
        });

        // When Forward restores the entry
        const result = remapReplacedReportIDs(action);

        // Then valid report references are repaired without throwing or altering malformed data
        expect(result).toEqual(
            CommonActions.reset({
                routes: [{name: SCREENS.REPORT_DETAILS.DYNAMIC_ROOT, params: {reportID: '7200', backTo: '/e/7200?backTo=%invalid'}}],
            }),
        );
    });
});
