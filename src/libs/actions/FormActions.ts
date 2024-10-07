import type {NullishDeep, OnyxValue} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {OnyxFormDraftKey, OnyxFormKey} from '@src/ONYXKEYS';
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

function setDraftValues(formID: OnyxFormKey, draftValues: NullishDeep<OnyxValue<OnyxFormDraftKey>>) {
    Onyx.merge(`${formID}Draft`, draftValues ?? null);
}

function clearDraftValues(formID: OnyxFormKey) {
    Onyx.set(`${formID}Draft`, null);
}

function setFormValues(formId: OnyxFormKey, values: NullishDeep<OnyxValue<OnyxFormDraftKey>>) {
    Onyx.merge(formId, values ?? null);
}

function clearFormValues(formId: OnyxFormKey) {
    Onyx.set(formId, null);
}

export {clearDraftValues, clearErrorFields, clearErrors, setDraftValues, setErrorFields, setErrors, setIsLoading, setFormValues, clearFormValues};
