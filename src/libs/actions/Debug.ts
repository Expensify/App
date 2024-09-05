import type {OnyxMergeInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxCollectionKey, OnyxKey} from '@src/ONYXKEYS';

type DebugDetailsFormID = typeof ONYXKEYS.FORMS.DEBUG_REPORT_PAGE_FORM | typeof ONYXKEYS.FORMS.DEBUG_REPORT_ACTION_PAGE_FORM;

function resetDebugDetailsDraftForm(formID: DebugDetailsFormID) {
    Onyx.set(`${formID}Draft`, null);
}

function mergeDebugData<TKey extends OnyxKey | `${OnyxCollectionKey}${string}`>(onyxKey: TKey, onyxValue: OnyxMergeInput<TKey>) {
    Onyx.merge(onyxKey, onyxValue);
}

export default {
    resetDebugDetailsDraftForm,
    mergeDebugData,
};

export type {DebugDetailsFormID};
