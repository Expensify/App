import {use} from 'react';
import {RootVisibilityContext} from './RootContext';

function useIsPopoverVisible(): boolean {
    const value = use(RootVisibilityContext);
    if (!value) {
        throw new Error('useIsPopoverVisible() must be called inside <PopoverMenu.Root>.');
    }
    return value.isVisible;
}

export default useIsPopoverVisible;
