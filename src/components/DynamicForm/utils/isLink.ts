import type {DynamicFormContentItem, DynamicFormLink} from '@src/types/onyx';

function isLink(item: DynamicFormContentItem): item is DynamicFormLink {
    return !('type' in item) && 'url' in item;
}

export default isLink;
