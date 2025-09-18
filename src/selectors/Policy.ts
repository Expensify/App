import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

const activePolicySelector = (policy: OnyxEntry<Policy>) => (policy?.type !== CONST.POLICY.TYPE.PERSONAL ? policy : undefined);

// eslint-disable-next-line import/prefer-default-export we can have other selectors in the further
export {activePolicySelector};
