import React from 'react';
import {useRootState} from '@components/PopoverMenu/v2/root/RootContext';
import useSuppressSpaceScroll from '@hooks/useSuppressSpaceScroll';
import BaseContent from './BaseContent';
import type {BasePopoverProps} from './BaseContent';
import useMaxHeightStyle from './useMaxHeightStyle';

type ContentProps = BasePopoverProps;

/** Popover surface for menus that fit; for unbounded row counts, use `<ScrollableContent>`. */
function Content(props: ContentProps): React.ReactElement | null {
    const {
        state: {isVisible},
    } = useRootState(Content.displayName);
    // ScrollableContent skips this — the user opts into space scrolling the inner content.
    useSuppressSpaceScroll(isVisible);

    const maxHeightStyle = useMaxHeightStyle();

    return (
        <BaseContent
            // eslint-disable-next-line react/jsx-props-no-spreading -- forwarding the variant's caller props
            {...props}
            componentName={Content.displayName}
            maxHeightStyle={maxHeightStyle}
        />
    );
}

Content.displayName = 'PopoverMenu.Content';

export default Content;
export type {ContentProps};
