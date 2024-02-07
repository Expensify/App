import Onyx from 'react-native-onyx';
import type {KeyValueMapping, NullishDeep} from 'react-native-onyx';
import type {OnyxFormKeyWithoutDraft} from '@components/Form/types';
import FormUtils from '@libs/FormUtils';
import type {OnyxFormKey} from '@src/ONYXKEYS';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

function setIsLoading(formID: OnyxFormKey, isLoading: boolean) {
    Onyx.merge(formID, {isLoading});
}

function setErrors(formID: OnyxFormKey, errors: OnyxCommon.Errors) {
    Onyx.merge(formID, {errors});
}

function setErrorFields(formID: OnyxFormKey, errorFields: OnyxCommon.ErrorFields) {
    Onyx.merge(formID, {errorFields});
}

function clearErrors(formID: OnyxFormKey) {
    Onyx.merge(formID, {errors: null});
}

function clearErrorFields(formID: OnyxFormKey) {
    Onyx.merge(formID, {errorFields: null});
}

function setDraftValues(formID: OnyxFormKeyWithoutDraft, draftValues: NullishDeep<KeyValueMapping[`${OnyxFormKeyWithoutDraft}Draft`]>) {
    Onyx.merge(FormUtils.getDraftKey(formID), draftValues);
}

function clearDraftValues(formID: OnyxFormKeyWithoutDraft) {
    Onyx.set(FormUtils.getDraftKey(formID), {});
}

export {setDraftValues, setErrorFields, setErrors, clearErrors, clearErrorFields, setIsLoading, clearDraftValues};
