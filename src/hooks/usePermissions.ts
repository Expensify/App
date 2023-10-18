import {useContext, useMemo} from 'react';
import Permissions from '../libs/Permissions';
import {BetasContext} from '../components/OnyxProvider';

export default function usePermissions() {
    const betas = useContext(BetasContext);
    return useMemo(() => {
        let permissionKey: keyof typeof Permissions;
        const permissions: Partial<Record<typeof permissionKey, boolean>> = {};

        for (permissionKey in Permissions) {
            if (betas) {
                const checkerFunction = Permissions[permissionKey];

                permissions[permissionKey] = checkerFunction(betas);
            }
        }

        return permissions;
    }, [betas]);
}
