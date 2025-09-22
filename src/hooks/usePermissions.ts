import {useContext, useMemo} from 'react';
import {BetaConfigurationContext, BetasContext} from '@components/OnyxListItemProvider';
import Permissions from '@libs/Permissions';
import type Beta from '@src/types/onyx/Beta';

type PermissionKey = keyof typeof Permissions;
type UsePermissions = Partial<Record<Exclude<PermissionKey, 'isBetaEnabled'>, boolean>> & {isBetaEnabled: (beta: Beta) => boolean};
let permissionKey: PermissionKey;

export default function usePermissions(): UsePermissions {
    const betas = useContext(BetasContext);
    const betaConfiguration = useContext(BetaConfigurationContext);
    return useMemo(() => {
        const permissions: UsePermissions = {
            isBetaEnabled: (beta: Beta) => Permissions.isBetaEnabled(beta, betas, betaConfiguration),
        };

        for (permissionKey in Permissions) {
            if (permissionKey !== 'isBetaEnabled') {
                const checkerFunction = Permissions[permissionKey];
                permissions[permissionKey] = checkerFunction();
            }
        }

        return permissions;
    }, [betas, betaConfiguration]);
}
