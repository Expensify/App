import {act, renderHook} from '@testing-library/react-native';

import EnvironmentProvider from '@components/EnvironmentContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import CONST from '@src/CONST';
import usePermissions from '@src/hooks/usePermissions';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

/** What the build was compiled as, which differs from the resolved environment on TestFlight. */
const mockConfig = {ENVIRONMENT: CONST.ENVIRONMENT.DEV as string};
jest.mock('@src/CONFIG', () => ({
    __esModule: true,
    get default() {
        return {...jest.requireActual<{default: Record<string, unknown>}>('@src/CONFIG').default, ...mockConfig};
    },
}));

/**
 * Resolves on demand, so a case can assert before the native beta check settles. Shared, the way getEnvironment memoizes.
 * Modules like ApiUtils and ReportUtils resolve the environment at load time, so importing one here throws on this,
 * which is intended.
 */
const mockEnvironmentDeferred: {promise: Promise<string>; resolve: (environment: string) => void} = {
    promise: Promise.resolve(CONST.ENVIRONMENT.DEV),
    resolve: () => {},
};
jest.mock('@libs/Environment/getEnvironment', () => ({
    __esModule: true,
    default: () => mockEnvironmentDeferred.promise,
}));

type ChildrenProps = {
    children: React.ReactNode;
};

function Wrapper({children}: ChildrenProps) {
    return (
        <OnyxListItemProvider>
            <EnvironmentProvider>{children}</EnvironmentProvider>
        </OnyxListItemProvider>
    );
}

async function renderPermissions() {
    const rendered = renderHook(() => usePermissions(), {wrapper: Wrapper});
    await waitForBatchedUpdatesWithAct();
    return rendered;
}

async function settleEnvironment(environment: string) {
    await act(async () => {
        mockEnvironmentDeferred.resolve(environment);
        await mockEnvironmentDeferred.promise;
    });
    await waitForBatchedUpdatesWithAct();
}

describe('beta overrides and the resolved environment', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockConfig.ENVIRONMENT = CONST.ENVIRONMENT.DEV;
        mockEnvironmentDeferred.promise = new Promise<string>((resolve) => {
            mockEnvironmentDeferred.resolve = resolve;
        });
        await Onyx.clear();

        // Given an override that contradicts the account betas, so the two can be told apart
        await Onyx.set(ONYXKEYS.BETAS, []);
        await Onyx.set(ONYXKEYS.BETA_OVERRIDES, {[CONST.BETAS.DEFAULT_ROOMS]: true});
    });

    it('ignores overrides when the build and the resolved environment are both production', async () => {
        // Given a real production build
        mockConfig.ENVIRONMENT = CONST.ENVIRONMENT.PRODUCTION;
        const {result} = await renderPermissions();

        // Then the account betas win during the startup window, which is where real users spend the first renders
        expect(result.current.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS)).toBe(false);

        // When the environment resolves to production
        await settleEnvironment(CONST.ENVIRONMENT.PRODUCTION);

        // Then they still win
        expect(result.current.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS)).toBe(false);
    });

    it('ignores an override that forces a granted beta off in production', async () => {
        // Given a production build where the account grants the beta and the override pins it off
        mockConfig.ENVIRONMENT = CONST.ENVIRONMENT.PRODUCTION;
        await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.DEFAULT_ROOMS]);
        await Onyx.set(ONYXKEYS.BETA_OVERRIDES, {[CONST.BETAS.DEFAULT_ROOMS]: false});
        const {result} = await renderPermissions();

        // When the environment resolves to production
        await settleEnvironment(CONST.ENVIRONMENT.PRODUCTION);

        // Then the beta stays on, so an override cannot disable a feature for real users
        expect(result.current.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS)).toBe(true);
    });

    it('applies overrides immediately when the build itself is not production', async () => {
        // Given a build compiled as staging, where the config alone rules production out
        mockConfig.ENVIRONMENT = CONST.ENVIRONMENT.STAGING;

        // When it is rendered, before the environment resolves
        const {result} = await renderPermissions();

        // Then there is no blocked startup window at all
        expect(result.current.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS)).toBe(true);
    });

    it('applies overrides on a staging build even if the environment resolves to production', async () => {
        // Given a build compiled as staging
        mockConfig.ENVIRONMENT = CONST.ENVIRONMENT.STAGING;
        const {result} = await renderPermissions();

        // When the environment resolves to production, which takes both halves of the gate to disagree
        await settleEnvironment(CONST.ENVIRONMENT.PRODUCTION);

        // Then the override still wins, because only a build that is production by both measures blocks them
        expect(result.current.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS)).toBe(true);
    });

    it('applies overrides once the environment settles after mount, without the override changing', async () => {
        // Given a build compiled as production that is really a beta, which covers Android staging and TestFlight
        mockConfig.ENVIRONMENT = CONST.ENVIRONMENT.PRODUCTION;
        const {result} = await renderPermissions();
        const resolveBeforeSettling = result.current.isBetaEnabled;

        // Then the override is ignored until the native beta check resolves
        expect(result.current.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS)).toBe(false);

        // When it resolves to staging, which on a cold start lands after the first screens render
        await settleEnvironment(CONST.ENVIRONMENT.STAGING);

        // Then the override applies without toggling the switch. See https://github.com/Expensify/App/issues/102787
        expect(result.current.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS)).toBe(true);

        // And the resolver is a new function, since a memoized consumer only recomputes when that identity changes
        expect(result.current.isBetaEnabled).not.toBe(resolveBeforeSettling);
    });
});
