declare module 'node-mac-permissions' {
    type AuthType =
        | 'accessibility'
        | 'bluetooth'
        | 'calendar'
        | 'camera'
        | 'contacts'
        | 'full-disk-access'
        | 'input-monitoring'
        | 'location'
        | 'microphone'
        | 'music-library'
        | 'photos-add-only'
        | 'photos-read-write'
        | 'reminders'
        | 'speech-recognition'
        | 'screen';

    type PermissionType = 'authorized' | 'denied' | 'restricted';

    export type {AuthType, PermissionType};
}
