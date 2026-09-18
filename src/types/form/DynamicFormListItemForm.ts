import type {DynamicFormListItem} from '@src/types/onyx/DynamicFormField';
import type {FileObject} from '@src/types/utils/Attachment';

import type {BaseForm} from './Form';

/** The item being added or edited inside a list field; keys are the item schema's field keys */
type DynamicFormListItemForm = BaseForm & Record<string, string | boolean | string[] | FileObject[] | DynamicFormListItem[]>;

// eslint-disable-next-line import/prefer-default-export
export type {DynamicFormListItemForm};
