import Onyx from 'react-native-onyx';
import {PartialDeep} from 'type-fest';
import {KeyValueMapping} from 'react-native-onyx/lib/types';
import * as OnyxCommon from '../../types/onyx/OnyxCommon';
import {OnyxFormKey, OnyxKey, OnyxKeysMap} from '../../ONYXKEYS';
import {Form} from '../../types/onyx';

type KeysWhichCouldBeDraft<T extends OnyxFormKey | OnyxKeysMap['REIMBURSEMENT_ACCOUNT']> = T extends `${infer U}Draft` ? U : never;
type DraftKeysWithoutDraftSuffix = KeysWhichCouldBeDraft<OnyxFormKey | OnyxKeysMap['REIMBURSEMENT_ACCOUNT']>;

function setIsLoading(formID: OnyxFormKey, isLoading: boolean) {
    Onyx.merge(formID, {isLoading} satisfies Form);
}

function setErrors(formID: OnyxFormKey, errors: OnyxCommon.Errors) {
    Onyx.merge(formID, {errors} satisfies Form);
}

function setErrorFields(formID: OnyxFormKey, errorFields: OnyxCommon.ErrorFields) {
    Onyx.merge(formID, {errorFields} satisfies Form);
}

function setDraftValues<T extends DraftKeysWithoutDraftSuffix | OnyxKeysMap['REIMBURSEMENT_ACCOUNT']>(formID: T, draftValues: PartialDeep<KeyValueMapping[`${T}Draft`]>) {
    Onyx.merge(`${formID}Draft` as OnyxKey, draftValues);
}
// TODO: Remove this once we have fix for a types
setDraftValues('reimbursementAccount', {});

export {setIsLoading, setErrors, setErrorFields, setDraftValues};
