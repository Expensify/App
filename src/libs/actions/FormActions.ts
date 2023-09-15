import Onyx from 'react-native-onyx';
import * as OnyxCommon from '../../types/onyx/OnyxCommon';
import {OnyxKey, OnyxValues} from '../../ONYXKEYS';

type ExtractValueByKey<T, K extends keyof T> = T[K];

function setIsLoading(formID: OnyxKey, isLoading: boolean) {
    Onyx.merge(formID, {isLoading});
}

function setErrors(formID: OnyxKey, errors: OnyxCommon.Errors) {
    Onyx.merge(formID, {errors});
}

function setErrorFields(formID: OnyxKey, errorFields: OnyxCommon.ErrorFields) {
    Onyx.merge(formID, {errorFields});
}

function setDraftValues<T extends keyof OnyxValues>(formID: T, draftValues: ExtractValueByKey<OnyxValues, T>) {
    Onyx.merge(`${formID}Draft`, draftValues);
}
setDraftValues('reimbursementAccount', {});
export {setIsLoading, setErrors, setErrorFields, setDraftValues};
