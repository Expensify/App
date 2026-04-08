import type {ValueOf} from 'type-fest';
import type {SubPageProps} from '@hooks/useSubPage/types';
import type CONST from '@src/CONST';
import type {InternationalBankAccountForm} from '@src/types/form';
import type {CorpayFieldsMap} from '@src/types/onyx/CorpayFields';

type CustomSubPageProps = SubPageProps & {
    /** User's form values */
    formValues: InternationalBankAccountForm;

    /** Fields map for the step rendering */
    fieldsMap: Record<ValueOf<typeof CONST.CORPAY_FIELDS.PAGE_NAME>, CorpayFieldsMap>;
};

export default CustomSubPageProps;
