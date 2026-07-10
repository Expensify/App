import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';

import type {Route} from '@src/ROUTES';

type PendingPresetAvatar = {type: 'preset'; id: string};
type PendingFileAvatar = {type: 'file'; file: File | CustomRNImageManipulatorResult; uri: string};
type PendingAvatar = PendingPresetAvatar | PendingFileAvatar | null;

let pendingAvatar: PendingAvatar = null;
let initialPresetID: string | undefined;
let returnRoute: Route | undefined;

function setInitialPresetID(id: string | undefined) {
    initialPresetID = id;
}

function getInitialPresetID(): string | undefined {
    return initialPresetID;
}

function setPendingAvatar(avatar: PendingAvatar) {
    pendingAvatar = avatar;
}

function getPendingAvatar(): PendingAvatar {
    return pendingAvatar;
}

function clearPendingAvatar() {
    pendingAvatar = null;
}

function setReturnRoute(route: Route | undefined) {
    returnRoute = route;
}

function getReturnRoute(): Route | undefined {
    return returnRoute;
}

export {setInitialPresetID, getInitialPresetID, setPendingAvatar, getPendingAvatar, clearPendingAvatar, setReturnRoute, getReturnRoute};
