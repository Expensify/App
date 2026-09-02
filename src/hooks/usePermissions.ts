import {BetaConfigurationContext, BetasContext, BetaOverridesContext} from '@components/OnyxListItemProvider';

import Permissions from '@libs/Permissions';

import type Beta from '@src/types/onyx/Beta';

import {useContext, useMemo} from 'react';

import useEnvironment from './useEnvironment';

type PermissionKey = keyof typeof Permissions;
type UsePermissions = Partial<Record<Exclude<PermissionKey, 'isBetaEnabled'>, boolean>> & {isBetaEnabled: (beta: Beta) => boolean};
let permissionKey: PermissionKey;

export default function usePermissions(): UsePermissions {
    const betas = useContext(BetasContext);
    const betaConfiguration = useContext(BetaConfigurationContext);
    const betaOverrides = useContext(BetaOverridesContext);
    // Permissions gates overrides on the resolved environment, which arrives asynchronously, so re-resolve then
    const {environment} = useEnvironment();
    return useMemo(() => {
        const permissions: UsePermissions = {
            isBetaEnabled: (beta: Beta) => Permissions.isBetaEnabled(beta, betas, betaConfiguration, betaOverrides),
        };

        for (permissionKey in Permissions) {
            if (permissionKey !== 'isBetaEnabled') {
                const checkerFunction = Permissions[permissionKey];
                permissions[permissionKey] = checkerFunction();
            }
        }

        return permissions;
    }, [betas, betaConfiguration, betaOverrides, environment]);
}
