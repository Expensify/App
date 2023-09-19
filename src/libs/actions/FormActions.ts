import Onyx from 'react-native-onyx';
import * as OnyxCommon from '../../types/onyx/OnyxCommon';
import {OnyxKey, OnyxValues} from '../../ONYXKEYS';

type KeysWhichCouldBeDraft<T extends keyof OnyxValues> = T extends `${infer U}Draft` ? U : never;
type GetDraftValue<T extends DraftKeysWithoutDraftSuffix> = T extends keyof OnyxValues ? OnyxValues[`${T}Draft`] : never;
type DraftKeysWithoutDraftSuffix = KeysWhichCouldBeDraft<keyof OnyxValues>;

function setIsLoading(formID: OnyxKey, isLoading: boolean) {
    Onyx.merge(formID, {isLoading});
}

function setErrors(formID: OnyxKey, errors: OnyxCommon.Errors) {
    Onyx.merge(formID, {errors});
}

function setErrorFields(formID: OnyxKey, errorFields: OnyxCommon.ErrorFields) {
    Onyx.merge(formID, {errorFields});
}

function setDraftValues<T extends DraftKeysWithoutDraftSuffix>(formID: T, draftValues: GetDraftValue<T>) {
    Onyx.merge(`${formID}Draft`, draftValues);
}

export {setIsLoading, setErrors, setErrorFields, setDraftValues};
