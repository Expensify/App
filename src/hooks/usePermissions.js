import _ from 'underscore';
import {useContext, useMemo} from 'react';
import Permissions from '../libs/Permissions';
import {BetasContext} from '../components/OnyxProvider';

export default function usePermissions() {
    const betas = useContext(BetasContext);
    return useMemo(() => {
        const permissions = {};
        _.each(Permissions, (checkerFunction, beta) => {
            permissions[beta] = checkerFunction(betas);
        });
        return permissions;
    }, [betas]);
}
