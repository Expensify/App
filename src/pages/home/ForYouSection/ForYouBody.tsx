/**
 * The For You card's body. One shimmer block stands in for the whole body during app load, rather than each
 * group deferring on its own, so no heading or row appears mid-load as its data lands.
 */
import useLocalize from '@hooks/useLocalize';

import HomeTaskGroup from '@pages/home/HomeTaskGroup';

import React from 'react';

import EmptyState from './EmptyState';
import ForYouSkeleton from './ForYouSkeleton';

type ForYouBodyProps = {
    isInitialLoad: boolean;

    /** Only consulted while loading: a user known to be mid-onboarding gets no shimmer, since the body it stands in for is empty */
    shouldShowSkeleton: boolean;

    timeSensitiveRows: React.ReactNode[];

    todoRows: React.ReactNode[];

    shouldShowEmptyState: boolean;
};

function ForYouBody({isInitialLoad, shouldShowSkeleton, timeSensitiveRows, todoRows, shouldShowEmptyState}: ForYouBodyProps) {
    const {translate} = useLocalize();

    if (isInitialLoad) {
        return shouldShowSkeleton ? <ForYouSkeleton /> : null;
    }

    return (
        <>
            <HomeTaskGroup
                title={translate('homePage.timeSensitiveSection.title')}
                rows={timeSensitiveRows}
            />
            <HomeTaskGroup
                title={translate('homePage.toDos')}
                rows={todoRows}
                reducedTopGap={timeSensitiveRows.length > 0}
            >
                {shouldShowEmptyState ? <EmptyState /> : null}
            </HomeTaskGroup>
        </>
    );
}

export default ForYouBody;
