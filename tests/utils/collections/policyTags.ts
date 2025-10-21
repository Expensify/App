import {randWord} from '@ngneat/falso';
import type {PolicyTagLists, PolicyTags} from '@src/types/onyx';

export default function createRandomPolicyTags(tagListName: string, numberOfTags = 0): PolicyTagLists {
    const tags: PolicyTags = {};
    for (let i = 0; i < numberOfTags; i++) {
        // Prevent the tag name from being duplicated, which can happen when a lot of tests are being ran
        // and can cause tests to fail because tag lists must always contain a unique set of tags
        const tagName = `${randWord()}${i}`;
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
