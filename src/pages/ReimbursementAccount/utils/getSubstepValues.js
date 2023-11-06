import lodashGet from 'lodash/get';
import lodashReduce from 'lodash/reduce';
import getDefaultStateForField from './getDefaultStateForField';

/**
 * Returns values for substep confirmation page
 *
 * @param {Object} inputKeys object that stores substep info keys
 *
 * @param {Object} reimbursementAccountDraft object that stores substep info draft data
 *
 * @param {Object} reimbursementAccount object that stores substep info data
 *
 * @returns {Object}
 */
function getSubstepValues(inputKeys, reimbursementAccountDraft, reimbursementAccount) {
    return lodashReduce(
        Object.entries(inputKeys),
        (acc, [, value]) => ({...acc, [value]: lodashGet(reimbursementAccountDraft, value, '') || getDefaultStateForField({reimbursementAccount, fieldName: value, defaultValue: ''})}),
        {},
    );
}

export default getSubstepValues;
