import type {PropsWithChildren} from 'react';

type SearchTabContextHoldProps = PropsWithChildren<{
    /** False while the idle preload is building the tab, which needs the live contexts until its first content is on screen. */
    shouldHoldWhenHidden: boolean;
}>;

export default SearchTabContextHoldProps;
