import Onyx from 'react-native-onyx';
import {PartialDeep} from 'type-fest';
import {KeyValueMapping} from 'react-native-onyx/lib/types';
import * as OnyxCommon from '../../types/onyx/OnyxCommon';
import {OnyxKey, OnyxValues} from '../../ONYXKEYS';

type KeysWhichCouldBeDraft<T extends keyof OnyxValues> = T extends `${infer U}Draft` ? U : never;
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

function setDraftValues<T extends DraftKeysWithoutDraftSuffix>(formID: T, draftValues: PartialDeep<KeyValueMapping[`${T}Draft`]>) {
    Onyx.merge(`${formID}Draft`, draftValues);
}

export {setIsLoading, setErrors, setErrorFields, setDraftValues};
