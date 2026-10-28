import type {FormValue} from '@components/Form/types';

import type {BaseForm} from './Form';

/** The list item being added or edited. Its keys are the item schema's field keys. */
type DynamicFormListItemForm = BaseForm & Record<string, FormValue>;

// eslint-disable-next-line import/prefer-default-export
export type {DynamicFormListItemForm};
