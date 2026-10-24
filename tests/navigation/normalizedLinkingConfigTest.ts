import createNormalizedConfigs from '@libs/Navigation/helpers/createNormalizedConfigs';
import type {RouteConfig} from '@libs/Navigation/helpers/createNormalizedConfigs';
import type * as LinkingConfig from '@libs/Navigation/linkingConfig/config';
import {config, dynamicTabScreensByHost, normalizedConfigs, screensWithOnyxTabNavigator} from '@libs/Navigation/linkingConfig/config';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

describe('normalized linking config', () => {
    it('retains complete real normalizer payloads and nested screen names', () => {
        // Given the real config and normalizer supply every entry, including navigator names
        expect(config).toBeDefined();
        if (config === undefined) {
            throw new Error('Real linking config must be defined');
        }
        const screens = config.screens;
        const routes = Object.keys(screens).flatMap((screen) => createNormalizedConfigs(screen, screens, [], [], []));

        // When the real module indexes those emitted routes in traversal order
        const names = Object.keys(normalizedConfigs);

        // Then no emitted name or payload is discarded and the last duplicate wins
        expect(names).toEqual([...new Set(routes.map((route) => route.screen))]);
        for (const route of routes) {
            expect(normalizedConfigs[route.screen]).toEqual(routes.findLast((entry) => entry.screen === route.screen));
        }
        expect(normalizedConfigs[SCREENS.ONBOARDING.EMPLOYEES]).toMatchObject({
            path: ROUTES.ONBOARDING_EMPLOYEES.route,
            pattern: ROUTES.ONBOARDING_EMPLOYEES.route,
            routeNames: [NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR, SCREENS.ONBOARDING.EMPLOYEES],
        });
        expect(normalizedConfigs[NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR]).toBeDefined();
        expect(normalizedConfigs['missing-screen']).toBeUndefined();
        const report = normalizedConfigs[SCREENS.REPORT];
        expect(report).toBeDefined();
        expect(report?.regex).toBeInstanceOf(RegExp);
        expect(report?.parse?.reportID).toBeInstanceOf(Function);
    });

    it('uses the real dynamic classifier and excludes navigator hosts', () => {
        // Given the receipt partner screen declares a real dynamic tab navigator
        const host = SCREENS.WORKSPACE.DYNAMIC_RECEIPT_PARTNERS_INVITE_EDIT;

        // When the actual config module collects its tab children
        const tabs = dynamicTabScreensByHost.get(host);

        // Then all real tab names survive while navigation containers stay excluded
        expect(normalizedConfigs[host]?.path).toBe(DYNAMIC_ROUTES.WORKSPACE_RECEIPT_PARTNERS_INVITE_EDIT.path);
        expect(screensWithOnyxTabNavigator.has(host)).toBe(true);
        expect(tabs).toEqual(
            new Map([
                [CONST.TAB.RECEIPT_PARTNERS.ALL, CONST.TAB.RECEIPT_PARTNERS.ALL],
                [CONST.TAB.RECEIPT_PARTNERS.LINKED, CONST.TAB.RECEIPT_PARTNERS.LINKED],
                [CONST.TAB.RECEIPT_PARTNERS.OUTSTANDING, CONST.TAB.RECEIPT_PARTNERS.OUTSTANDING],
            ]),
        );
        for (const navigator of Object.values(NAVIGATORS)) {
            expect(screensWithOnyxTabNavigator.has(navigator)).toBe(false);
        }
    });

    it('retains empty and nested paths from the real normalizer', () => {
        // Given native path config supports an empty parent path and nested string children
        const screens: Parameters<typeof createNormalizedConfigs>[1] = {Root: {path: '', screens: {Child: 'child'}}};

        // When the real normalizer processes this supported category
        const routes = createNormalizedConfigs('Root', screens, [], [], []);

        // Then empty paths remain entries and children retain their full hierarchy
        expect(routes).toHaveLength(2);
        expect(routes.at(0)).toEqual({screen: 'Root', path: '', pattern: '', regex: undefined, routeNames: ['Root'], parse: undefined});
        const child = routes.at(1);
        expect(child).toBeDefined();
        expect(child).toMatchObject({screen: 'Child', path: 'child', pattern: 'child', routeNames: ['Root', 'Child'], parse: undefined});
        expect(child?.regex).toBeInstanceOf(RegExp);
    });

    it('keeps complete last duplicate values without moving their insertion position', () => {
        // Given a typed producer emits duplicate names, an empty path and a non-Screen name
        const parse = {id: (value: string) => value.toUpperCase()};
        const first: RouteConfig = {screen: 'Duplicate', path: 'first', pattern: 'first', routeNames: ['First', 'Duplicate']};
        const empty: RouteConfig = {screen: 'Empty', path: '', pattern: '', routeNames: ['Empty']};
        const last: RouteConfig = {screen: 'Duplicate', path: 'last/:id', pattern: 'last/:id', regex: /last\/(.+)/, routeNames: ['Last', 'Duplicate'], parse};
        const produce = jest
            .fn<ReturnType<typeof createNormalizedConfigs>, Parameters<typeof createNormalizedConfigs>>()
            .mockReturnValueOnce([first, empty])
            .mockReturnValueOnce([last])
            .mockReturnValue([]);
        jest.doMock('@libs/Navigation/helpers/createNormalizedConfigs', () => ({__esModule: true, default: produce}));
        try {
            jest.isolateModules(() => {
                // When only the normalizer producer is doubled and the target accumulator remains real
                const isolated = jest.requireActual<typeof LinkingConfig>('@libs/Navigation/linkingConfig/config');

                // Then the last full payload wins and the first property position stays fixed
                expect(Object.keys(isolated.normalizedConfigs)).toEqual(['Duplicate', 'Empty']);
                expect(isolated.normalizedConfigs.Duplicate).toBe(last);
                expect(isolated.normalizedConfigs.Empty).toBe(empty);
            });
        } finally {
            jest.dontMock('@libs/Navigation/helpers/createNormalizedConfigs');
        }
    });
});
