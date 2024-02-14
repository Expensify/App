import type {OnyxFormDraftKey, OnyxFormKey} from '@src/ONYXKEYS';

function getDraftKey(formID: OnyxFormKey): OnyxFormDraftKey {
    return `${formID}Draft` as const;
}

export default {getDraftKey};
