import type {ScrollToTabProps} from './types';

function scrollToTab({tabRef, animated = true}: ScrollToTabProps) {
    if (!tabRef || !('scrollIntoView' in tabRef)) {
        return;
    }

    tabRef.scrollIntoView({block: 'nearest', behavior: animated ? 'smooth' : 'instant'});
}

export default scrollToTab;
