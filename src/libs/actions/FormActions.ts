import Onyx from 'react-native-onyx';
import * as OnyxCommon from '../../types/onyx/OnyxCommon';
import {OnyxKey, OnyxValues} from '../../ONYXKEYS';
// TODO: Ask where to put this type
type MapUnionToValue<T> = T extends keyof OnyxValues ? OnyxValues[T] : never;

function setIsLoading(formID: OnyxKey, isLoading: boolean) {
    Onyx.merge(formID, {isLoading});
}

function setErrors(formID: OnyxKey, errors: OnyxCommon.Errors) {
    Onyx.merge(formID, {errors});
}

function setErrorFields(formID: OnyxKey, errorFields: OnyxCommon.ErrorFields) {
    Onyx.merge(formID, {errorFields});
}

function setDraftValues<T extends OnyxKey>(formID: T, draftValues: MapUnionToValue<T>) {
    // TODO: Ask about what should we do here ?
    Onyx.merge(`${formID}Draft`, draftValues);
}

export {setIsLoading, setErrors, setErrorFields, setDraftValues};
