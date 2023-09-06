import Onyx from 'react-native-onyx';
import * as OnyxCommon from '../../types/onyx/OnyxCommon';
import {OnyxKey, OnyxValues} from '../../ONYXKEYS';

function setIsLoading(formID: OnyxKey, isLoading: boolean) {
    Onyx.merge(formID, {isLoading});
}

function setErrors(formID: OnyxKey, errors: OnyxCommon.Errors) {
    Onyx.merge(formID, {errors});
}

function setErrorFields(formID: OnyxKey, errorFields: OnyxCommon.ErrorFields) {
    Onyx.merge(formID, {errorFields});
}

type KeysWhichCouldBeDraft<T extends string> = T extends `${infer Prefix}Draft` ? Prefix : never;
type MapUnionToValue<T> = T extends keyof OnyxValues ? OnyxValues[T] : never;
type KeysWithDraftSuffix<T extends string> = T extends `${infer Prefix}Draft` ? T : never;

function setDraftValues<T extends KeysWithDraftSuffix<OnyxKey>>(formID: KeysWhichCouldBeDraft<T>, draftValues: MapUnionToValue<T>) {
    Onyx.merge(`${formID}Draft`, draftValues);
}
setDraftValues('', {});

export {setIsLoading, setErrors, setErrorFields, setDraftValues};
