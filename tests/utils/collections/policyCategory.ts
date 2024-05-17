import {randWord} from '@ngneat/falso';
import type {PolicyCategories} from '@src/types/onyx';

export default function createRandomPolicyCategories(numberOfCategories = 0): PolicyCategories {
    const categories: PolicyCategories = {};
    for (let i = 0; i < numberOfCategories; i++) {
        const categoryName = randWord();
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
