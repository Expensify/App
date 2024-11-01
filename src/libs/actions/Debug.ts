import type {OnyxMergeInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxCollectionKey, OnyxKey} from '@src/ONYXKEYS';

function resetDebugDetailsDraftForm() {
    Onyx.set(ONYXKEYS.FORMS.DEBUG_DETAILS_FORM_DRAFT, null);
}

function mergeDebugData<TKey extends OnyxKey | `${OnyxCollectionKey}${string}`>(onyxKey: TKey, onyxValue: OnyxMergeInput<TKey>) {
    Onyx.merge(onyxKey, onyxValue);
}

export default {
    resetDebugDetailsDraftForm,
    mergeDebugData,
};
