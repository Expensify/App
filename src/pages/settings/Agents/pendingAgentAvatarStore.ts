import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';

type PendingPresetAvatar = {type: 'preset'; id: string};
type PendingFileAvatar = {type: 'file'; file: File | CustomRNImageManipulatorResult; uri: string};
type PendingAvatar = PendingPresetAvatar | PendingFileAvatar | null;

let pendingAvatar: PendingAvatar = null;
let initialPresetID: string | undefined;
let navigationToken = false;

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

function setNavigationToken() {
    navigationToken = true;
}

function consumeNavigationToken(): boolean {
    const token = navigationToken;
    navigationToken = false;
    return token;
}

export type {PendingAvatar, PendingPresetAvatar, PendingFileAvatar};
export {setInitialPresetID, getInitialPresetID, setPendingAvatar, getPendingAvatar, clearPendingAvatar, setNavigationToken, consumeNavigationToken};
