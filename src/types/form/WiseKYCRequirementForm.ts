import type {DynamicFormListItem} from '@src/types/onyx/DynamicFormField';
import type {FileObject} from '@src/types/utils/Attachment';

import type {BaseForm} from './Form';

/** Answers to one Wise KYC requirement while it is being filled in; keys are the requirement schema's field keys */
type WiseKYCRequirementForm = BaseForm & Record<string, string | boolean | string[] | FileObject[] | DynamicFormListItem[]>;

// eslint-disable-next-line import/prefer-default-export
export type {WiseKYCRequirementForm};
