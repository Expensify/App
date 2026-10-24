import type {GetTargetedAdvertisingConsent, SubscribeToTargetedAdvertisingConsent} from './types';

// Ketch is only loaded on web (see web/index.html), so native never knows the consent and never sends it.
const getTargetedAdvertisingConsent: GetTargetedAdvertisingConsent = () => undefined;

const subscribeToTargetedAdvertisingConsent: SubscribeToTargetedAdvertisingConsent = () => () => {};

export {getTargetedAdvertisingConsent, subscribeToTargetedAdvertisingConsent};
