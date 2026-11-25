import type {DynamicFormContentItem, DynamicFormHeading} from '@src/types/onyx';

import isNotice from './isNotice';

function isHeading(item: DynamicFormContentItem): item is DynamicFormHeading {
    return !('type' in item) && !('url' in item) && !isNotice(item);
}

export default isHeading;
