import {MenuItemProps} from '@components/MenuItem';

import type {MergeConnectionErrorFieldName} from '@libs/actions/connections/merge';
import type {HRConnectionName} from '@libs/merge/HRUtils';
import type {RecruitingConnectionName} from '@libs/merge/RecruitingUtils';

import type CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import type {PolicyConnectionSyncStage} from '@src/types/onyx/Policy';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ValueOf} from 'type-fest';

/** Which workspace page a Merge provider card is rendered on. Picks the category-specific copy shown on the card. */
type MergeProviderCardCategory = ValueOf<typeof CONST.POLICY.CONNECTIONS.CATEGORY>;

/** A single editable configuration row (approval mode, final approver, groups, filters) shown on a connected Merge provider card. */
type MergeProviderConfigRow = {
    /** Onyx field this row maps to. */
    field: MergeConnectionErrorFieldName;

    /** Translated label shown as the row's top description. */
    description?: string;

    /** Current value shown as the row title, or undefined when nothing is set yet. */
    title?: string;

    /** Optional icon shown at the start of the row. */
    icon?: MenuItemProps['icon'];

    /** Renders the row as a plain `MenuItem` instead of the default `MenuItemWithTopDescription`. Use it for rows that are a plain label rather than a labelled value. */
    shouldRenderAsMenuItem?: boolean;

    /** Route opened when the row is tapped. */
    route: Route;

    /** Pending action for this field while an update is in progress. */
    pendingAction?: PendingAction;

    /** Errors for this field when the last update failed. */
    errors?: Errors | null;
};

/** Everything `MergeProviderCard` needs to render one integration, on either the HR or the Recruiting page. */
type MergeProviderCardDescriptor = {
    /** Unique identifier for this card. */
    key: string;

    /** The page this card belongs to, which decides the category-specific copy. */
    category: MergeProviderCardCategory;

    /** The Onyx connection name that identifies this provider. */
    connectionName: HRConnectionName | RecruitingConnectionName;

    /** Human-readable provider name shown in the UI (e.g. "Gusto", "Greenhouse"). */
    displayName: string;

    /** Provider logo — either a remote URL string or a local icon asset. */
    icon: string | IconAsset;

    /** URL to open to start the connection flow for this provider. */
    setupLink?: string;

    /** Whether this provider is currently connected to the workspace. */
    isConnected: boolean;

    /** Whether a sync operation is currently running for this provider. */
    isSyncInProgress: boolean;

    /** Whether this provider's first-ever (initial) sync is currently running (Merge connections only). */
    isInitialSyncInProgress?: boolean;

    /** Navigation route to the post-connect setup RHP. Set only while the admin still needs to finish setup. */
    completeSetupRoute?: Route;

    /** ISO date string of the last successful sync, used for "last synced" display. */
    successfulDate?: string;

    /** Whether the last sync resulted in an error. */
    hasError: boolean;

    /** Whether the card should switch into "reconnect mode". Shows the error message and the Reconnect link. */
    needsReconnect: boolean;

    /** Human-readable error message from the last failed sync attempt. */
    lastSyncErrorMessage?: string;

    /** Current stage of an in-progress sync, used to show step-level progress. Only the directly integrated HR providers report one. */
    syncStageInProgress?: PolicyConnectionSyncStage;

    /** Editable configuration rows shown on a connected card, in display order. */
    configRows?: MergeProviderConfigRow[];
};

export type {MergeProviderCardCategory, MergeProviderCardDescriptor, MergeProviderConfigRow};
