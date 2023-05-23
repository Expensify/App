import _ from 'underscore';
import {useMemo} from 'react';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import Permissions from '../libs/Permissions';

let betas = [];
// eslint-disable-next-line rulesdir/prefer-onyx-connect-in-libs
Onyx.connect({
    key: ONYXKEYS.BETAS,
    callback: (val) => (betas = val),
});

export default function usePermissions() {
    const result = useMemo(
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
        betas,
    );
    return result;
}
