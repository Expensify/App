import type {OnyxEntry} from 'react-native-onyx';
import type HybridApp from '@src/types/onyx/HybridApp';

const isSingleNewDotEntrySelector = (hybridApp: OnyxEntry<HybridApp>) => hybridApp?.isSingleNewDotEntry;

const isClosingReactNativeAppSelector = (hybridApp: OnyxEntry<HybridApp>) => hybridApp?.closingReactNativeApp;

export {isSingleNewDotEntrySelector, isClosingReactNativeAppSelector};
