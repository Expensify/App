import type {TableData} from '@components/Table/types';

import type {FlashListRef} from '@shopify/flash-list';
import type {Ref, RefObject} from 'react';
import type {View} from 'react-native';

/**
 * Keeps a copy of the column header aligned with the columns while the list scrolls horizontally, and returns the
 * callback ref that copy's clip has to carry.
 *
 * Once the columns are wider than the table, the list's own scroller takes the horizontal axis too (see `TableBody`),
 * so a header rendered outside that scroller — the stuck overlay copy, or the whole header of a table that renders it
 * beside the list instead of inside it — is never carried sideways and has to mirror the scroller's offset itself.
 *
 * The ref belongs on a clipped (`overflow: hidden`) View wrapping content wider than itself: moving it mirrors the
 * rows without adding a second thing the user can scroll. The offset never passes through React state, because
 * scrolling the columns must not re-render a table row.
 *
 * No-op on native, where `canMeasureText` reports text measurement as unsupported, so the columns are never sized
 * from their content and the rows always fit.
 */
type UseTableColumnScroll = (listRef: RefObject<FlashListRef<TableData> | null>, isEnabled: boolean) => Ref<View>;

// eslint-disable-next-line import/prefer-default-export
export type {UseTableColumnScroll};
