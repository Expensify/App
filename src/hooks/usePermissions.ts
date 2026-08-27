import {BetaConfigurationContext, BetasContext, BetasOverrideContext} from '@components/OnyxListItemProvider';

import Permissions from '@libs/Permissions';

import type Beta from '@src/types/onyx/Beta';
import type BetasOverride from '@src/types/onyx/BetasOverride';

import {useContext, useMemo} from 'react';

import useEnvironment from './useEnvironment';

const NO_BETA_OVERRIDES: BetasOverride = {};

type PermissionKey = keyof typeof Permissions;
type UsePermissions = Partial<Record<Exclude<PermissionKey, 'isBetaEnabled'>, boolean>> & {isBetaEnabled: (beta: Beta) => boolean};
let permissionKey: PermissionKey;

export default function usePermissions(): UsePermissions {
    const betas = useContext(BetasContext);
    const betaConfiguration = useContext(BetaConfigurationContext);
    const betasOverride = useContext(BetasOverrideContext);
    const {isProduction} = useEnvironment();
    return useMemo(() => {
        const permissions: UsePermissions = {
            isBetaEnabled: (beta: Beta) => Permissions.isBetaEnabled(beta, betas, betaConfiguration, isProduction ? NO_BETA_OVERRIDES : betasOverride),
        };

        for (permissionKey in Permissions) {
            if (permissionKey !== 'isBetaEnabled') {
                const checkerFunction = Permissions[permissionKey];
                permissions[permissionKey] = checkerFunction();
            }
        }

        return permissions;
    }, [betas, betaConfiguration, betasOverride, isProduction]);
}
