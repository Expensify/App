import type {OnyxFormKeyWithoutDraft} from '@components/Form/types';

function getDraftKey(formID: OnyxFormKeyWithoutDraft): `${OnyxFormKeyWithoutDraft}Draft` {
    return `${formID}Draft`;
}

export default {getDraftKey};
