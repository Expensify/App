import Onyx from 'react-native-onyx';
import * as OnyxCommon from '../../types/onyx/OnyxCommon';
import {OnyxKey, OnyxValues} from '../../ONYXKEYS';

type KeysWhichCouldBeDraft<T extends keyof OnyxValues> = T extends `${infer U}Draft` ? U : never;
// type DraftKey<T extends DraftKeysWithoutDraftSuffix> = T extends DraftKeysWithoutDraftSuffix ? keyof OnyxValues[`${T}Draft`] : never;
type GetDraftValue<T extends keyof OnyxValues> = T extends keyof OnyxValues ? OnyxValues[T] : never;
type DraftKeysWithoutDraftSuffix = KeysWhichCouldBeDraft<keyof OnyxValues>;
type GetDraftKey<T extends DraftKeysWithoutDraftSuffix> = T extends `${infer Prefix}Draft` ? T : `${T}Draft`;
function setIsLoading(formID: OnyxKey, isLoading: boolean) {
    Onyx.merge(formID, {isLoading});
}

function setErrors(formID: OnyxKey, errors: OnyxCommon.Errors) {
    Onyx.merge(formID, {errors});
}

function setErrorFields(formID: OnyxKey, errorFields: OnyxCommon.ErrorFields) {
    Onyx.merge(formID, {errorFields});
}

function setDraftValues<T extends DraftKeysWithoutDraftSuffix>(formID: DraftKeysWithoutDraftSuffix, draftValues: GetDraftValue<GetDraftKey<T>>) {
    Onyx.merge(`${formID}Draft`, draftValues);
}
setDraftValues('customStatus', {});
export {setIsLoading, setErrors, setErrorFields, setDraftValues};
