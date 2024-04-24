import React from 'react';
import TableListItemSkeleton from '@components/Skeletons/TableListItemSkeleton';

function EmptySearchView() {
    return <TableListItemSkeleton shouldAnimate />;
}

EmptySearchView.displayName = 'EmptySearchView';

export default EmptySearchView;
