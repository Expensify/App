import React, {useCallback} from 'react';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import type {SearchAutocompleteListProps} from '@components/Search/SearchAutocompleteList';
import SearchAutocompleteList from '@components/Search/SearchAutocompleteList';
import CONST from '@src/CONST';

/**
 * This component acts as a wrapper for a SearchAutocompleteList, waiting for the navigation to be ready and deferring it,
 * so that the base UI can render before the list is loaded.
 * This enables the SearchRouterPage to open smoothly with a placeholder and load the list in the meantime.
 */
function DeferredAutocompleteList(props: SearchAutocompleteListProps) {
    const [shouldRender, setShouldRender] = React.useState(false);
    const [, startTransition] = React.useTransition();

    // Run the transition after the skeleton is mounted
    const renderComponent = useCallback(() => startTransition(() => setShouldRender(true)), []);

    if (!shouldRender) {
        return (
            <OptionsListSkeletonView
                fixedNumItems={4}
                shouldStyleAsTable
                onLayout={renderComponent}
                speed={CONST.TIMING.SKELETON_ANIMATION_SPEED}
            />
        );
    }

    // eslint-disable-next-line react/jsx-props-no-spreading -- This is a transparent wrapper that forwards all props to SearchAutocompleteList
    return <SearchAutocompleteList {...props} />;
}

DeferredAutocompleteList.displayName = 'DeferredSearchAutocompleteList';

export default DeferredAutocompleteList;
