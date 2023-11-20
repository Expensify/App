import {useContext, useMemo} from 'react';
import {BetasContext} from '@components/OnyxProvider';
import Permissions from '@libs/Permissions';

type PermissionKey = keyof typeof Permissions;
type UsePermissions = Partial<Record<PermissionKey, boolean>>;
let permissionKey: PermissionKey;

export default function usePermissions(): UsePermissions {
    const betas = useContext(BetasContext);
    return useMemo(() => {
        const permissions: UsePermissions = {};

        for (permissionKey in Permissions) {
            if (betas) {
                const checkerFunction = Permissions[permissionKey];

                permissions[permissionKey] = checkerFunction(betas);
            }
        }

        return permissions;
    }, [betas]);
}
