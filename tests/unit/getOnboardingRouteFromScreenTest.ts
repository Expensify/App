import type {OnboardingScreen} from '@libs/getOnboardingStepCounter';
import getOnboardingRouteFromScreen from '@libs/Navigation/helpers/getOnboardingRouteFromScreen';
import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';

import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

const onboardingRoutes = [
    [SCREENS.ONBOARDING.PERSONAL_DETAILS, ROUTES.ONBOARDING_PERSONAL_DETAILS.route],
    [SCREENS.ONBOARDING.PRIVATE_DOMAIN, ROUTES.ONBOARDING_PRIVATE_DOMAIN.route],
    [SCREENS.ONBOARDING.EMPLOYEES, ROUTES.ONBOARDING_EMPLOYEES.route],
    [SCREENS.ONBOARDING.ACCOUNTING, ROUTES.ONBOARDING_ACCOUNTING.route],
    [SCREENS.ONBOARDING.INTERESTED_FEATURES, ROUTES.ONBOARDING_INTERESTED_FEATURES.route],
    [SCREENS.ONBOARDING.PURPOSE, ROUTES.ONBOARDING_PURPOSE.route],
    [SCREENS.ONBOARDING.WORKSPACES, ROUTES.ONBOARDING_WORKSPACES.route],
    [SCREENS.ONBOARDING.WORK_EMAIL, ROUTES.ONBOARDING_WORK_EMAIL.route],
    [SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, ROUTES.ONBOARDING_WORK_EMAIL_VALIDATION.route],
    [SCREENS.ONBOARDING.PERSONAL_TRACK_GOAL, ROUTES.ONBOARDING_PERSONAL_TRACK_GOAL.route],
] satisfies Array<[OnboardingScreen, Route]>;

describe('getOnboardingRouteFromScreen', () => {
    it('returns the linking config path for an onboarding screen', () => {
        // Given the configured employees screen is part of onboarding
        // When its base route is requested without back navigation
        // Then it retains the existing route literal
        expect(getOnboardingRouteFromScreen(SCREENS.ONBOARDING.EMPLOYEES)).toBe(ROUTES.ONBOARDING_EMPLOYEES.route);
    });

    it('returns undefined for screens without a linking config path', () => {
        // Given a screen whose normalized entry is temporarily absent
        const screen = SCREENS.ONBOARDING.EMPLOYEES;
        const config = normalizedConfigs[screen];

        // When the helper sees no configured path
        Reflect.deleteProperty(normalizedConfigs, screen);

        try {
            // Then it preserves absence instead of inventing a route
            expect(getOnboardingRouteFromScreen(screen)).toBeUndefined();
        } finally {
            normalizedConfigs[screen] = config;
        }
    });

    it('matches ROUTES.getRoute when backTo is provided', () => {
        // Given a nested route without encoding collisions
        const backTo = ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute();

        // When the helper adds the back destination
        // Then this simple value matches the existing factory
        expect(getOnboardingRouteFromScreen(SCREENS.ONBOARDING.WORKSPACES, backTo)).toBe(ROUTES.ONBOARDING_WORKSPACES.getRoute(backTo));
    });
});

describe('onboarding route boundaries', () => {
    it.each(onboardingRoutes)('retains the real normalized base and query bytes for %s', (screen, base) => {
        // Given every finite onboarding base must agree with its real config producer
        const config = normalizedConfigs[screen];
        expect(config).toBeDefined();
        expect(config?.path).toBe(base);
        const backTo = `r/a b+c&d?e#f%g'"雪`;

        // When absent, empty and nested back destinations reach the real helper
        const withoutBackTo = getOnboardingRouteFromScreen(screen);
        const emptyBackTo = getOnboardingRouteFromScreen(screen, '');
        const nestedBackTo = getOnboardingRouteFromScreen(screen, backTo);

        // Then URLSearchParams keeps its exact collision and Unicode encoding
        expect(withoutBackTo).toBe(base);
        expect(emptyBackTo).toBe(base);
        expect(nestedBackTo).toBe(`${base}?backTo=r%2Fa+b%2Bc%26d%3Fe%23f%25g%27%22%E9%9B%AA`);
    });

    it.each(['absent', 'undefined', 'empty'] as const)('retains the normalized %s gate', (kind) => {
        // Given a real entry whose exact presence must be restored after the scenario
        const screen = SCREENS.ONBOARDING.EMPLOYEES;
        const hadEntry = Object.hasOwn(normalizedConfigs, screen);
        const original = normalizedConfigs[screen];
        expect(original).toBeDefined();
        if (!original) {
            return;
        }
        try {
            if (kind === 'absent') {
                Reflect.deleteProperty(normalizedConfigs, screen);
            } else if (kind === 'undefined') {
                Reflect.set(normalizedConfigs, screen, undefined);
            } else {
                normalizedConfigs[screen] = {...original, path: ''};
            }

            // When a typed fallback base exists but the normalized path is unavailable
            const result = getOnboardingRouteFromScreen(screen, 'r/123');

            // Then the original absence gate still wins
            expect(result).toBeUndefined();
        } finally {
            if (hadEntry) {
                normalizedConfigs[screen] = original;
            } else {
                Reflect.deleteProperty(normalizedConfigs, screen);
            }
        }
    });

    it('retains the six direct factories and their legacy encoding', () => {
        // Given direct callers still use the original factory parameters
        const backTo = `r/a b+c&d?e#f%g'"雪`;
        const legacyQuery = `?backTo=r%2Fa%20b%2Bc%26d%3Fe%23f%25g'%22%E9%9B%AA`;

        // When the six corrected declarations invoke their unchanged bodies
        const routes = [
            ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute(backTo),
            ROUTES.ONBOARDING_EMPLOYEES.getRoute(backTo),
            ROUTES.ONBOARDING_PURPOSE.getRoute(backTo),
            ROUTES.ONBOARDING_PERSONAL_TRACK_GOAL.getRoute(backTo),
            ROUTES.ONBOARDING_ACCOUNTING.getRoute(),
            ROUTES.ONBOARDING_INTERESTED_FEATURES.getRoute(),
        ];

        // Then declaration corrections do not alter direct factory bytes
        expect(routes).toEqual([
            `onboarding/personal-details${legacyQuery}`,
            `onboarding/employees${legacyQuery}`,
            `onboarding/purpose${legacyQuery}`,
            `onboarding/personaltrackcase${legacyQuery}`,
            'onboarding/accounting',
            'onboarding/interested-features',
        ]);
        expect(ROUTES.ONBOARDING_EMPLOYEES.getRoute()).toBe('onboarding/employees');
        expect(ROUTES.ONBOARDING_EMPLOYEES.getRoute('')).toBe('onboarding/employees');
    });
});
