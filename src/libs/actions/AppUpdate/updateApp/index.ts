import {getAppUpdateURL} from '@libs/AppUpdateURL';

/**
 * The upgrade marker prevents a slow network from sending the user back to an unsupported cached shell.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function updateApp(isProduction: boolean) {
    window.location.replace(getAppUpdateURL(window.location.href));
}
