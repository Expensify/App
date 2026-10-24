import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type TargetedAdvertisingConsent = ValueOf<typeof CONST.TARGETED_ADVERTISING_CONSENT>;

type TargetedAdvertisingConsentCallback = (consent: TargetedAdvertisingConsent) => void;

type GetTargetedAdvertisingConsent = () => TargetedAdvertisingConsent | undefined;

type SubscribeToTargetedAdvertisingConsent = (callback: TargetedAdvertisingConsentCallback) => () => void;

export type {TargetedAdvertisingConsent, TargetedAdvertisingConsentCallback, GetTargetedAdvertisingConsent, SubscribeToTargetedAdvertisingConsent};
