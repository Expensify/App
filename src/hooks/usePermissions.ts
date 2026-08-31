import {BetaConfigurationContext, BetasContext, BetaOverridesContext} from '@components/OnyxListItemProvider';

import Permissions from '@libs/Permissions';

import type Beta from '@src/types/onyx/Beta';
import type BetaOverrides from '@src/types/onyx/BetaOverrides';

import {useContext, useMemo} from 'react';

import useEnvironment from './useEnvironment';

const NO_BETA_OVERRIDES: BetaOverrides = {};

type PermissionKey = keyof typeof Permissions;
type UsePermissions = Partial<Record<Exclude<PermissionKey, 'isBetaEnabled'>, boolean>> & {isBetaEnabled: (beta: Beta) => boolean};
let permissionKey: PermissionKey;

export default function usePermissions(): UsePermissions {
    const betas = useContext(BetasContext);
    const betaConfiguration = useContext(BetaConfigurationContext);
    const betaOverrides = useContext(BetaOverridesContext);
    const {isProduction} = useEnvironment();
    return useMemo(() => {
        const permissions: UsePermissions = {
            isBetaEnabled: (beta: Beta) => Permissions.isBetaEnabled(beta, betas, betaConfiguration, isProduction ? NO_BETA_OVERRIDES : betaOverrides),
        };

        for (permissionKey in Permissions) {
            if (permissionKey !== 'isBetaEnabled') {
                const checkerFunction = Permissions[permissionKey];
                permissions[permissionKey] = checkerFunction();
            }
        }

        return permissions;
    }, [betas, betaConfiguration, betaOverrides, isProduction]);
}
