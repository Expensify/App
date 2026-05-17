import {config} from '@libs/Navigation/linkingConfig/config';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type NestedScreenConfig = {
    path?: string;
    screens?: Record<string, NestedScreenConfig>;
};

function getNestedScreenConfig(rootConfig: typeof config, ...keys: string[]): NestedScreenConfig | undefined {
    let current: NestedScreenConfig | undefined = rootConfig as NestedScreenConfig;
    for (const key of keys) {
        current = current?.screens?.[key];
    }
    return current;
}

describe('ReportSettingsColumns route and navigation', () => {
    describe('ROUTES.REPORT_SETTINGS_COLUMNS', () => {
        it('should have the correct route pattern', () => {
            expect(ROUTES.REPORT_SETTINGS_COLUMNS.route).toBe('r/:reportID/settings/columns');
        });

        it('should generate the correct path with getRoute', () => {
            const reportID = '123456';
            expect(ROUTES.REPORT_SETTINGS_COLUMNS.getRoute(reportID)).toBe(`r/${reportID}/settings/columns`);
        });

        it('should generate unique paths for different report IDs', () => {
            const route1 = ROUTES.REPORT_SETTINGS_COLUMNS.getRoute('111');
            const route2 = ROUTES.REPORT_SETTINGS_COLUMNS.getRoute('222');
            expect(route1).not.toBe(route2);
            expect(route1).toBe('r/111/settings/columns');
            expect(route2).toBe('r/222/settings/columns');
        });
    });

    describe('SCREENS.REPORT_SETTINGS.COLUMNS', () => {
        it('should have the correct screen name', () => {
            expect(SCREENS.REPORT_SETTINGS.COLUMNS).toBe('Report_Settings_Columns');
        });

        it('should be a unique screen name within REPORT_SETTINGS', () => {
            const screenNames = Object.values(SCREENS.REPORT_SETTINGS);
            const uniqueNames = new Set(screenNames);
            expect(uniqueNames.size).toBe(screenNames.length);
        });
    });

    describe('linkingConfig', () => {
        it('should map COLUMNS screen to the correct route path', () => {
            const columnsConfig = getNestedScreenConfig(config, NAVIGATORS.RIGHT_MODAL_NAVIGATOR, SCREENS.RIGHT_MODAL.REPORT_SETTINGS, SCREENS.REPORT_SETTINGS.COLUMNS);

            expect(columnsConfig?.path).toBe(ROUTES.REPORT_SETTINGS_COLUMNS.route);
        });
    });

    describe('ModalStackNavigator registration', () => {
        it('should have ReportSettingsModalStackNavigator exported', () => {
            const navigators = require<Record<string, unknown>>('@libs/Navigation/AppNavigator/ModalStackNavigators/index');

            expect(navigators.ReportSettingsModalStackNavigator).toBeDefined();
        });
    });
});
