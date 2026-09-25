import type {DynamicFormListItem} from '@src/types/onyx/DynamicFormField';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {FileObject} from '@src/types/utils/Attachment';

import type {BaseForm} from './Form';

type WiseKYCRequirementAnswer = string | boolean | string[] | FileObject[] | DynamicFormListItem[];

/** Answers to one Wise KYC requirement while it is being filled in; keys are the requirement schema's field keys. The index signature admits the base form's errors so a failed submit can be recorded */
type WiseKYCRequirementForm = BaseForm & Record<string, WiseKYCRequirementAnswer | OnyxCommon.Errors | null | undefined>;

// eslint-disable-next-line import/prefer-default-export
export type {WiseKYCRequirementForm};
