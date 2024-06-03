import {addMonths, format, startOfMonth} from 'date-fns';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/SubscriptionSizeForm';

const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SUBSCRIPTION_SIZE_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.SUBSCRIPTION_SIZE_FORM> => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.SUBSCRIPTION_SIZE]);
    if (values[INPUT_IDS.SUBSCRIPTION_SIZE] && !ValidationUtils.isValidSubscriptionSize(values[INPUT_IDS.SUBSCRIPTION_SIZE])) {
        errors.subscriptionSize = 'subscription.subscriptionSize.error.size';
    }

    return errors;
};

const getNewSubscriptionRenewalDate = (): string => format(startOfMonth(addMonths(new Date(), 12)), CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT);

export {validate, getNewSubscriptionRenewalDate};
