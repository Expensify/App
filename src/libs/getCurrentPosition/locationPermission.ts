import type {ValueOf} from 'type-fest';

const LOCATION_PERMISSION_STATES = {
    GRANTED: 'granted',
    DENIED: 'denied',
    PROMPT: 'prompt',
} as const;

type LocationPermissionState = ValueOf<typeof LOCATION_PERMISSION_STATES>;

export type {LocationPermissionState};
export {LOCATION_PERMISSION_STATES};
