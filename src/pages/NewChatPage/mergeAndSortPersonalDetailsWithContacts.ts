import lodashUniqBy from 'lodash/uniqBy';
import {orderPersonalDetailsOptions} from '@libs/OptionsListUtils';
import type {SearchOptionData} from '@libs/OptionsListUtils';
import {addSMSDomainIfPhoneNumber} from '@libs/PhoneNumber';

/**
 * Merges Onyx personal details with imported contacts, removes entries without login,
 * de-dupes by normalized login (case-insensitive, with SMS-domain normalization),
 * and returns the union sorted alphabetically.
 *
 * Onyx options are placed first in the merge order, so when logins collide
 * the Onyx entry is preserved over the imported contact entry.
 */
function mergeAndSortPersonalDetailsWithContacts<T extends SearchOptionData>(allPersonalDetailOptions: T[], contacts: T[]): T[] {
    const merged = [...allPersonalDetailOptions, ...contacts].filter((option) => !!option.login);
    const deduped = lodashUniqBy(merged, (option) => addSMSDomainIfPhoneNumber(option.login).toLowerCase());
    return orderPersonalDetailsOptions(deduped);
}

export default mergeAndSortPersonalDetailsWithContacts;
