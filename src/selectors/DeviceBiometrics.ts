import type {OnyxEntry} from 'react-native-onyx';
import type {DeviceBiometrics} from '@src/types/onyx';

const hasAcceptedSoftPromptSelector = (deviceBiometrics: OnyxEntry<DeviceBiometrics>) => deviceBiometrics?.hasAcceptedSoftPrompt;

// eslint-disable-next-line import/prefer-default-export
export {hasAcceptedSoftPromptSelector};
