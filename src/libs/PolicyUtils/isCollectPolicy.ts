import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

function isCollectPolicy(policy: OnyxEntry<Policy>): boolean {
    return policy?.type === CONST.POLICY.TYPE.TEAM;
}

// eslint-disable-next-line import/prefer-default-export -- PolicyUtils/index.ts re-exports this with `export *`, which skips default exports
export {isCollectPolicy};
