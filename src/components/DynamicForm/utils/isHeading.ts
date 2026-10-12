import type {DynamicFormContentItem, DynamicFormHeading} from '@src/types/onyx';

function isHeading(item: DynamicFormContentItem): item is DynamicFormHeading {
    return !('type' in item);
}

export default isHeading;
