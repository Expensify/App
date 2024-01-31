import type {OnyxFormKeyWithoutDraft} from '@components/Form/types';

function getDraftKey<Key extends OnyxFormKeyWithoutDraft>(formID: Key): `${Key}Draft` {
    return `${formID}Draft`;
}

export default {getDraftKey};
