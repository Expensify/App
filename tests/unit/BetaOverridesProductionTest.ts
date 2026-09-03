import defaultPermissions from '@libs/Permissions';

import CONST from '@src/CONST';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type PermissionsModule = typeof defaultPermissions;

/**
 * The overrides key survives app resets and is included in exported Onyx state, so it can reach a production build.
 * Permissions resolves the environment once on import, so each case loads it in a fresh module registry. `configEnvironment`
 * is what the build was compiled with and `resolvedEnvironment` is what getEnvironment reports, which differ on TestFlight.
 *
 * Returns the module before the resolution lands, which is the only way to observe the value seeded from the config.
 */
function loadPermissions(resolvedEnvironment: string, configEnvironment = resolvedEnvironment) {
    jest.resetModules();
    jest.doMock('@libs/Environment/getEnvironment', () => ({
        __esModule: true,
        default: () => Promise.resolve(resolvedEnvironment),
    }));
    jest.doMock('@src/CONFIG', () => ({
        __esModule: true,
        default: {...jest.requireActual<{default: Record<string, unknown>}>('@src/CONFIG').default, ENVIRONMENT: configEnvironment},
    }));

    let permissions: PermissionsModule = defaultPermissions;
    jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        permissions = require('@libs/Permissions').default;
    });

    return permissions;
}

async function loadPermissionsAfterEnvironmentResolves(resolvedEnvironment: string, configEnvironment = resolvedEnvironment) {
    const permissions = loadPermissions(resolvedEnvironment, configEnvironment);

    // the environment is resolved through two promises before Permissions stores it
    await waitForBatchedUpdates();

    return permissions;
}

describe('beta overrides in production', () => {
    it('ignores overrides on a production build before the resolved environment arrives', async () => {
        // Given a production build whose environment has not resolved yet, so only the compiled config is known
        const Permissions = loadPermissions(CONST.ENVIRONMENT.PRODUCTION);

        // When a beta is resolved with an override pinned on, without waiting for the resolution
        // Then the value seeded from the config already blocks it
        expect(Permissions.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS, [], undefined, {[CONST.BETAS.DEFAULT_ROOMS]: true})).toBe(false);

        // settle the pending resolution here rather than letting it land during another case
        await waitForBatchedUpdates();
    });

    it('ignores overrides when the environment is production', async () => {
        // Given a production build
        const Permissions = await loadPermissionsAfterEnvironmentResolves(CONST.ENVIRONMENT.PRODUCTION);

        // When a beta is resolved with an override pinned against the server betas
        // Then the server betas win
        expect(Permissions.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS, [], undefined, {[CONST.BETAS.DEFAULT_ROOMS]: true})).toBe(false);
        expect(Permissions.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS, [CONST.BETAS.DEFAULT_ROOMS], undefined, {[CONST.BETAS.DEFAULT_ROOMS]: false})).toBe(true);
    });

    it('applies overrides when the environment is staging', async () => {
        // Given a staging build
        const Permissions = await loadPermissionsAfterEnvironmentResolves(CONST.ENVIRONMENT.STAGING);

        // When a beta is resolved with an override pinned against the server betas
        // Then the override wins
        expect(Permissions.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS, [], undefined, {[CONST.BETAS.DEFAULT_ROOMS]: true})).toBe(true);
        expect(Permissions.isBetaEnabled(CONST.BETAS.ASAP_SUBMIT, [CONST.BETAS.ASAP_SUBMIT], undefined, {[CONST.BETAS.ASAP_SUBMIT]: false})).toBe(false);
    });

    it('applies overrides on a TestFlight build, which is compiled as production but resolves to staging', async () => {
        // Given a build compiled as production that the resolved environment downgrades to staging
        const Permissions = await loadPermissionsAfterEnvironmentResolves(CONST.ENVIRONMENT.STAGING, CONST.ENVIRONMENT.PRODUCTION);

        // When a beta is resolved with an override pinned against the server betas
        // Then the override wins, since only the resolved environment counts
        expect(Permissions.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS, [], undefined, {[CONST.BETAS.DEFAULT_ROOMS]: true})).toBe(true);
    });
});
