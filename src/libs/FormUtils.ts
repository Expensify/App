import {OnyxFormKey} from '@src/ONYXKEYS';

type ExcludeDraft<T> = T extends `${string}Draft` ? never : T;
type OnyxFormKeyWithoutDraft = ExcludeDraft<OnyxFormKey>;

function getDraftKey(formID: OnyxFormKeyWithoutDraft): `${OnyxFormKeyWithoutDraft}Draft` {
    return `${formID}Draft`;
}

export default {getDraftKey};
