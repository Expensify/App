import type {OnyxMergeInput, OnyxSetInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxCollectionKey, OnyxKey} from '@src/ONYXKEYS';

type NonCollectionKey = Exclude<OnyxKey, OnyxCollectionKey>;
type CollectionMemberKey = `${OnyxCollectionKey}${string}`;
// Debug keys are always non-collection keys or collection member keys (e.g. "report_123"), never bare collection keys
type DebugKey = NonCollectionKey | CollectionMemberKey;

function resetDebugDetailsDraftForm() {
    Onyx.set(ONYXKEYS.FORMS.DEBUG_DETAILS_FORM_DRAFT, null);
}

function setDebugData<TKey extends DebugKey>(onyxKey: TKey, onyxValue: OnyxSetInput<TKey>) {
    Onyx.set(onyxKey as NonCollectionKey, onyxValue as OnyxSetInput<NonCollectionKey>);
}

function mergeDebugData<TKey extends DebugKey>(onyxKey: TKey, onyxValue: OnyxMergeInput<TKey>) {
    Onyx.merge(onyxKey as NonCollectionKey, onyxValue as OnyxMergeInput<NonCollectionKey>);
}

export default {
    resetDebugDetailsDraftForm,
    setDebugData,
    mergeDebugData,
};
