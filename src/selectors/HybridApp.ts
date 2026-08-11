import type HybridApp from '@src/types/onyx/HybridApp';

import type {OnyxEntry} from 'react-native-onyx';

const isSingleNewDotEntrySelector = (hybridApp: OnyxEntry<HybridApp>) => hybridApp?.isSingleNewDotEntry;

const isClosingReactNativeAppSelector = (hybridApp: OnyxEntry<HybridApp>) => hybridApp?.closingReactNativeApp;

export {isSingleNewDotEntrySelector, isClosingReactNativeAppSelector};
