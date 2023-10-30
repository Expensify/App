import Onyx from 'react-native-onyx';
import {KeyValueMapping, NullishDeep} from 'react-native-onyx/lib/types';
import {OnyxFormKey} from '@src/ONYXKEYS';
import {Form} from '@src/types/onyx';
import * as OnyxCommon from '@src/types/onyx/OnyxCommon';

type ExcludeDraft<T> = T extends `${string}Draft` ? never : T;
type OnyxFormKeyWithoutDraft = ExcludeDraft<OnyxFormKey>;

function setIsLoading(formID: OnyxFormKey, isLoading: boolean) {
    Onyx.merge(formID, {isLoading} satisfies Form);
}

function setErrors(formID: OnyxFormKey, errors: OnyxCommon.Errors) {
    Onyx.merge(formID, {errors} satisfies Form);
}

function setErrorFields(formID: OnyxFormKey, errorFields: OnyxCommon.ErrorFields) {
    Onyx.merge(formID, {errorFields} satisfies Form);
}

function setDraftValues<T extends OnyxFormKeyWithoutDraft>(formID: T, draftValues: NullishDeep<KeyValueMapping[`${T}Draft`]>) {
    Onyx.merge(`${formID}Draft`, draftValues);
}

export {setDraftValues, setErrorFields, setErrors, setIsLoading};
