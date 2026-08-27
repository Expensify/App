import defaultPermissions from '@libs/Permissions';

import CONST from '@src/CONST';

type PermissionsModule = typeof defaultPermissions;

/**
 * The overrides key survives app resets and is included in exported Onyx state, so it can reach a production build.
 * Permissions resolves the environment once on import, so each case loads it in a fresh module registry.
 */
function loadPermissionsForEnvironment(environment: string) {
    jest.resetModules();
    jest.doMock('@libs/Environment/getEnvironment', () => ({
        __esModule: true,
        default: () => Promise.resolve(environment),
    }));

    let permissions: PermissionsModule = defaultPermissions;
    jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        permissions = require('@libs/Permissions').default;
    });

    return Promise.resolve().then(() => permissions);
}

describe('beta overrides in production', () => {
    it('ignores overrides when the environment is production', async () => {
        const Permissions = await loadPermissionsForEnvironment(CONST.ENVIRONMENT.PRODUCTION);

        // Override says on, but the server betas win in production
        expect(Permissions.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS, [], undefined, {[CONST.BETAS.DEFAULT_ROOMS]: true})).toBe(false);
        expect(Permissions.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS, [CONST.BETAS.DEFAULT_ROOMS], undefined, {[CONST.BETAS.DEFAULT_ROOMS]: false})).toBe(true);
    });

    it('applies overrides when the environment is staging', async () => {
        const Permissions = await loadPermissionsForEnvironment(CONST.ENVIRONMENT.STAGING);

        expect(Permissions.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS, [], undefined, {[CONST.BETAS.DEFAULT_ROOMS]: true})).toBe(true);
        expect(Permissions.isBetaEnabled(CONST.BETAS.ASAP_SUBMIT, [CONST.BETAS.ASAP_SUBMIT], undefined, {[CONST.BETAS.ASAP_SUBMIT]: false})).toBe(false);
    });
});
