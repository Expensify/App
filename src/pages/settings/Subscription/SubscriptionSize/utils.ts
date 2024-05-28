import {addMonths, format, startOfMonth} from 'date-fns';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import * as ValidationUtils from '@libs/ValidationUtils';
import type ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/SubscriptionSizeForm';

const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SUBSCRIPTION_SIZE_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.SUBSCRIPTION_SIZE_FORM> => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.SUBSCRIPTION_SIZE]);
    if (values[INPUT_IDS.SUBSCRIPTION_SIZE] && !ValidationUtils.isNumeric(values[INPUT_IDS.SUBSCRIPTION_SIZE])) {
        errors.subscriptionSize = 'subscriptionSize.error.size';
    }

    return errors;
};

const getNewSubscriptionRenewalDate = (): string => format(startOfMonth(addMonths(new Date(), 11)), 'MMM d, yyyy');

export {validate, getNewSubscriptionRenewalDate};
