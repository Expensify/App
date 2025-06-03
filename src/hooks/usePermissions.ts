import {useContext, useMemo} from 'react';
import {BetasContext} from '@components/OnyxProvider';
import Permissions from '@libs/Permissions';
import type Beta from '@src/types/onyx/Beta';

type PermissionKey = keyof typeof Permissions;
type UsePermissions = Partial<Record<Exclude<PermissionKey, 'isBetaEnabled'>, boolean>> & {isBetaEnabled: (beta: Beta) => boolean};
let permissionKey: PermissionKey;

export default function usePermissions(): UsePermissions {
    const betas = useContext(BetasContext);
    return useMemo(() => {
        const permissions: UsePermissions = {
            isBetaEnabled: (beta: Beta) => Permissions.isBetaEnabled(beta, betas),
        };

        for (permissionKey in Permissions) {
            if (betas && permissionKey !== 'isBetaEnabled') {
                const checkerFunction = Permissions[permissionKey];

                permissions[permissionKey] = checkerFunction(betas);
            }
        }

        return permissions;
    }, [betas]);
}
