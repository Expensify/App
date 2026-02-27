import type {ValueOf} from 'type-fest';
import type {SubStepProps} from '@hooks/useSubStep/types';
import type CONST from '@src/CONST';
import type {InternationalBankAccountForm} from '@src/types/form';
import type {CorpayFieldsMap} from '@src/types/onyx/CorpayFields';

type CustomSubStepProps = SubStepProps & {
    /** User's form values */
    formValues: InternationalBankAccountForm;

    /** Fields map for the step rendering */
    fieldsMap: Record<ValueOf<typeof CONST.CORPAY_FIELDS.STEPS_NAME>, CorpayFieldsMap>;
};

export default CustomSubStepProps;
