import Onyx from 'react-native-onyx';
import type {NullishDeep} from 'react-native-onyx';
import FormUtils from '@libs/FormUtils';
import type {OnyxFormDraftKey, OnyxFormKey, OnyxValue} from '@src/ONYXKEYS';
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
    Onyx.merge(FormUtils.getDraftKey(formID), draftValues);
}

function clearDraftValues(formID: OnyxFormKey) {
    Onyx.set(FormUtils.getDraftKey(formID), null);
}

export {setDraftValues, setErrorFields, setErrors, clearErrors, clearErrorFields, setIsLoading, clearDraftValues};
