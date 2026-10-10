import type {FormValue} from '@components/Form/types';

import type {DynamicFormField, DynamicFormFieldType} from '@src/types/onyx';

/** Current answers keyed by draft key. */
type DynamicFormValues = Partial<Record<string, FormValue>>;

/** The variant of one type. An intersection rather than Extract, since one variant can cover several types, such as select and radio. */
type DynamicFormFieldOfType<TType extends DynamicFormFieldType> = DynamicFormField & {type: TType};

export type {DynamicFormFieldOfType, DynamicFormValues};
