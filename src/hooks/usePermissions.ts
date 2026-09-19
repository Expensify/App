import {BetaConfigurationContext, BetasContext, BetaOverridesContext} from '@components/OnyxListItemProvider';

import Permissions from '@libs/Permissions';

import type Beta from '@src/types/onyx/Beta';

import {useContext, useMemo} from 'react';

type PermissionKey = keyof typeof Permissions;
type UsePermissions = Partial<Record<Exclude<PermissionKey, 'isBetaEnabled'>, boolean>> & {
    isBetaEnabled: (beta: Beta) => boolean;
    isBetaEnabledOrUnknown: (beta: Beta) => boolean | undefined;
};
let permissionKey: PermissionKey;

export default function usePermissions(): UsePermissions {
    const betas = useContext(BetasContext);
    const betaConfiguration = useContext(BetaConfigurationContext);
    const betaOverrides = useContext(BetaOverridesContext);
    return useMemo(() => {
        const permissions: UsePermissions = {
            isBetaEnabled: (beta: Beta) => Permissions.isBetaEnabled(beta, betas, betaConfiguration, betaOverrides),

            // Prefer isBetaEnabled. This exists for the consumers that must tell "off" apart from "not loaded yet",
            // currently the inactive vendor violation and the approval mode next steps, reached from many components
            isBetaEnabledOrUnknown: (beta: Beta) => (betas === undefined ? undefined : Permissions.isBetaEnabled(beta, betas, betaConfiguration, betaOverrides)),
        };

        for (permissionKey in Permissions) {
            if (permissionKey !== 'isBetaEnabled') {
                const checkerFunction = Permissions[permissionKey];
                permissions[permissionKey] = checkerFunction();
            }
        }

        return permissions;
    }, [betas, betaConfiguration, betaOverrides]);
}
