import {useLayoutEffect} from 'react';
import type {ReactNode, RefObject} from 'react';
import type {View} from 'react-native';
import {usePopover} from './state';

type AnchorProps = {anchorRef: RefObject<View | null>; children?: ReactNode};

function Anchor({anchorRef: externalRef, children}: AnchorProps): ReactNode {
    const {actions} = usePopover('<Popover.Anchor>');
    const {setCustomAnchor} = actions;

    useLayoutEffect(() => {
        setCustomAnchor(externalRef.current ?? null);
    });

    useLayoutEffect(
        () => () => {
            setCustomAnchor(null);
        },
        [setCustomAnchor],
    );

    return children;
}

export default Anchor;
export type {AnchorProps as PopoverAnchorProps};
