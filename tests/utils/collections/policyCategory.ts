import {randWord} from '@ngneat/falso';
import type {PolicyCategories} from '@src/types/onyx';

export default function createRandomPolicyCategories(numberOfCategories = 0): PolicyCategories {
    const categories: PolicyCategories = {};
    for (let i = 0; i < numberOfCategories; i++) {
        // Prevent the category name from being duplicated, which can happen when a lot of tests are being ran
        // and can cause tests to fail because categories must always contain a unique set of names
        const categoryName = `${randWord()}${i}`;
        categories[categoryName] = {
            name: categoryName,
            enabled: false,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'GL Code': '',
            unencodedName: categoryName,
            externalID: '',
            areCommentsRequired: false,
            origin: '',
        };
    }

    return categories;
}
