import Onyx from 'react-native-onyx';
import {KeyValueMapping, NullishDeep} from 'react-native-onyx/lib/types';
import {OnyxFormKeyWithoutDraft} from '@components/Form/types';
import FormUtils from '@libs/FormUtils';
import {OnyxFormKey} from '@src/ONYXKEYS';
import {Form} from '@src/types/onyx';
import * as OnyxCommon from '@src/types/onyx/OnyxCommon';

function setIsLoading(formID: OnyxFormKey, isLoading: boolean) {
    Onyx.merge(formID, {isLoading} satisfies Form);
}

function setErrors(formID: OnyxFormKey, errors?: OnyxCommon.Errors | null) {
    Onyx.merge(formID, {errors} satisfies Form);
}

function setErrorFields(formID: OnyxFormKey, errorFields?: OnyxCommon.ErrorFields | null) {
    Onyx.merge(formID, {errorFields} satisfies Form);
}

function setDraftValues(formID: OnyxFormKeyWithoutDraft, draftValues: NullishDeep<KeyValueMapping[`${OnyxFormKeyWithoutDraft}Draft`]>) {
    Onyx.merge(FormUtils.getDraftKey(formID), draftValues);
}

/**
 * @param formID
 */
function clearDraftValues(formID: OnyxFormKeyWithoutDraft) {
    Onyx.merge(FormUtils.getDraftKey(formID), {});
}

export {setDraftValues, setErrorFields, setErrors, setIsLoading, clearDraftValues};
