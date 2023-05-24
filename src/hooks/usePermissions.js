import _ from 'underscore';
import {useContext, useMemo} from 'react';
import Permissions from '../libs/Permissions';
import {BetasContext} from '../components/OnyxProvider';

export default function usePermissions() {
    const betas = useContext(BetasContext);
    return useMemo(
        () =>
            _.reduce(
                Permissions,
                (memo, checkerFunction, beta) => {
                    // eslint-disable-next-line no-param-reassign
                    memo[beta] = checkerFunction(betas);
                    return memo;
                },
                {},
            ),
        [betas],
    );
}
