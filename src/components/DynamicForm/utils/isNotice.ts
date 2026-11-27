import type {DynamicFormContentItem, DynamicFormNotice} from '@src/types/onyx';

function isNotice(item: DynamicFormContentItem): item is DynamicFormNotice {
    return !('type' in item) && 'presentation' in item && item.presentation === 'notice';
}

export default isNotice;
