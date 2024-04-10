import {useContext, useMemo} from 'react';
import {BetasContext} from '@components/OnyxProvider';
import Permissions from '@libs/Permissions';
import type {IOUType} from '@src/CONST';

type PermissionKey = keyof typeof Permissions;
type UsePermissions = Partial<Record<PermissionKey, boolean>>;
let permissionKey: PermissionKey;

export default function usePermissions(iouType: IOUType | undefined = undefined): UsePermissions {
    const betas = useContext(BetasContext);
    return useMemo(() => {
        const permissions: UsePermissions = {};

        for (permissionKey in Permissions) {
            if (betas) {
                const checkerFunction = Permissions[permissionKey];

                permissions[permissionKey] = checkerFunction(betas, iouType);
            }
        }

        return permissions;
    }, [betas, iouType]);
}
