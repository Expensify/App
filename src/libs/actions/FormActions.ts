import Onyx from 'react-native-onyx';
import type {KeyValueMapping, NullishDeep} from 'react-native-onyx/lib/types';
import type {OnyxFormKeyWithoutDraft} from '@components/Form/types';
import FormUtils from '@libs/FormUtils';
import type {OnyxFormKey} from '@src/ONYXKEYS';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

function setIsLoading(formID: OnyxFormKey, isLoading: boolean) {
    Onyx.merge(formID, {isLoading});
}

function setErrors(formID: OnyxFormKey, errors?: OnyxCommon.Errors | null) {
    Onyx.merge(formID, {errors});
}

function setErrorFields(formID: OnyxFormKey, errorFields?: OnyxCommon.ErrorFields | null) {
    Onyx.merge(formID, {errorFields});
}

function setDraftValues(formID: OnyxFormKeyWithoutDraft, draftValues: NullishDeep<KeyValueMapping[`${OnyxFormKeyWithoutDraft}Draft`]>) {
    Onyx.merge(FormUtils.getDraftKey(formID), draftValues);
}

/**
 * @param formID
 */
function clearDraftValues(formID: OnyxFormKeyWithoutDraft) {
    Onyx.merge(FormUtils.getDraftKey(formID), {});
}

export {setDraftValues, setErrorFields, setErrors, setIsLoading, clearDraftValues};
