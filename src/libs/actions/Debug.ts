import type {OnyxMergeInput, OnyxMultiSetInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxCollectionKey, OnyxKey} from '@src/ONYXKEYS';

function resetDebugDetailsDraftForm() {
    Onyx.set(ONYXKEYS.FORMS.DEBUG_DETAILS_FORM_DRAFT, null);
}

function setDebugData<TKey extends OnyxKey | `${OnyxCollectionKey}${string}`>(onyxKey: TKey, onyxValue: OnyxMergeInput<TKey>) {
    Onyx.multiSet({[onyxKey]: onyxValue} as OnyxMultiSetInput);
}

function mergeDebugData<TKey extends OnyxKey | `${OnyxCollectionKey}${string}`>(onyxKey: TKey, onyxValue: OnyxMergeInput<TKey>) {
    Onyx.multiSet({[onyxKey]: onyxValue} as OnyxMultiSetInput);
}

export default {
    resetDebugDetailsDraftForm,
    setDebugData,
    mergeDebugData,
};
