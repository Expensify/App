import {randWord} from '@ngneat/falso';
import type {PolicyTagList, PolicyTags} from '@src/types/onyx';

export default function createRandomPolicyTags(tagListName: string, numberOfTags = 0): PolicyTagList {
    const tags: PolicyTags = {};
    for (let i = 0; i < numberOfTags; i++) {
        const tagName = randWord();
        tags[tagName] = {
            name: tagName,
            enabled: true,
        };
    }

    return {
        [tagListName]: {
            name: tagListName,
            orderWeight: 0,
            required: false,
            tags,
        },
    };
}
