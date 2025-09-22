import type {OnyxEntry} from 'react-native-onyx';

const lastVisitedPathSelector = (path: OnyxEntry<string | undefined>) => path ?? '';

export default lastVisitedPathSelector;
