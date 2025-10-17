import type {ValueOf} from 'type-fest';

export const LOCATION_PERMISSION_STATES = {
    GRANTED: 'granted',
    DENIED: 'denied',
    PROMPT: 'prompt',
} as const;

export type LocationPermissionState = ValueOf<typeof LOCATION_PERMISSION_STATES>;
