import Onyx from 'react-native-onyx';
import * as OnyxCommon from '../../types/onyx/OnyxCommon';
import {OnyxKey} from '../../ONYXKEYS';

function setIsLoading(formID: OnyxKey, isLoading: boolean) {
    Onyx.merge(formID, {isLoading});
}

function setErrors(formID: OnyxKey, errors: OnyxCommon.Errors) {
    Onyx.merge(formID, {errors});
}

function setErrorFields(formID: OnyxKey, errorFields: OnyxCommon.ErrorFields) {
    Onyx.merge(formID, {errorFields});
}

function setDraftValues(formID: OnyxKey, draftValues: unknown) {
    Onyx.merge(`${formID}Draft`, draftValues);
}

export {setIsLoading, setErrors, setErrorFields, setDraftValues};
