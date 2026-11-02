import type {SubPageProps} from '@hooks/useSubPage/types';

import type {BankAccountFieldsMap} from '@libs/BankAccountFields/types';

import type {CollectDepositAccountForm} from '@src/types/form';

type CustomSubPageProps = SubPageProps & {
    /** Values collected so far */
    formValues: CollectDepositAccountForm;

    /** Fields to render, chosen by the picked country and currency */
    fieldsMap: BankAccountFieldsMap;

    /** Whether local or international details are being collected */
    fieldsType: string;
};

export default CustomSubPageProps;
