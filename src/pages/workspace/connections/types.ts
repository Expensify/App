import type CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';
import type {ValueOf} from 'type-fest';

type ConnectionsTab = ValueOf<typeof CONST.TAB.CONNECTIONS>;

/** The tabs a listing can belong to. Popular and All are cross-cutting views built from the listings themselves. */
type ConnectionCategory = Exclude<ConnectionsTab, typeof CONST.TAB.CONNECTIONS.POPULAR | typeof CONST.TAB.CONNECTIONS.ALL>;

type ConnectionStatus = {
    /** A broken connection shows a Fix button instead of Configure */
    isBroken: boolean;

    message: string;
};

/** One integration on the Connections page, either available to connect or already connected. */
type ConnectionListing = {
    /** Unique across all categories, also used to decide which listings appear on the Popular tab */
    key: string;

    category: ConnectionCategory;

    title: string;

    /** Local asset, or a remote logo URL for Merge providers */
    icon?: IconAsset | string;

    /** Only set while the integration is connected to the workspace */
    status?: ConnectionStatus;

    onConnect: () => void;

    /** Opens the connection's settings. Only called for connected listings. */
    onConfigure?: () => void;

    /** Receives the element that starts the connection, since some accounting setup flows anchor a popover to it */
    registerConnectButton?: (button: ComponentRef<typeof View> | null) => void;
};

export type {ConnectionsTab, ConnectionCategory, ConnectionStatus, ConnectionListing};
