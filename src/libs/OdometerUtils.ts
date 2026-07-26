import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

import {getMimeTypeFromUri} from './fileDownload/FileUtils';
import getPlatform from './getPlatform';

function getOdometerImageUri(image: FileObject | string | null | undefined): string {
    return typeof image === 'string' ? image : (image?.uri ?? '');
}

function getOdometerImageName(image: FileObject | string | null | undefined): string {
    return typeof image === 'string' ? (image.split('/').pop() ?? '') : (image?.name ?? '');
}

/**
 * A re-mint-invariant identity for an odometer image, used in the discard-changes baseline diff.
 * `name|size|lastModified` is preserved across the draft round-trip, so it stays stable on resume/reload while still
 * changing for a real swap (`lastModified` disambiguates a different file that happens to share name + size).
 * When `lastModified` is missing we fall back to the uri ONLY on native, where the `file://` uri is durable, unique per
 * selection (rand64 suffix), and stable across the round-trip (no blob re-mint) - so a same-name/same-size swap stays
 * detectable. On web the uri is a volatile `blob:` that re-mints on every resume/reload, so including it would fire a
 * false discard prompt; there we use `name|size` alone.
 */
function getOdometerImageIdentity(image: FileObject | string | null | undefined): string {
    if (!image) {
        return '';
    }
    if (typeof image === 'string') {
        return image;
    }
    const base = `${image.name ?? ''}|${image.size ?? ''}`;
    if (image.lastModified !== undefined) {
        return `${base}|${image.lastModified}`;
    }
    // No lastModified: only native's durable file:// uri is a safe way to tell images apart. On web the uri is a volatile blob:
    // that re-mints on resume/reload, so name|size alone keeps the identity stable and avoids a false discard prompt.
    return getPlatform() === CONST.PLATFORM.WEB ? base : `${base}|${image.uri ?? ''}`;
}

function getOdometerImageType(image: FileObject | string | null | undefined): string | undefined {
    return typeof image === 'string' ? getMimeTypeFromUri(image) : (image?.type ?? getMimeTypeFromUri(image?.uri ?? ''));
}

/**
 * Revokes a blob URL previously associated with an odometer image, but only when
 * the image has actually changed (i.e. the old URL differs from the new one)
 */
function revokeOdometerImageUri(image: FileObject | string | null | undefined, nextImage?: FileObject | string | null): void {
    if (typeof URL === 'undefined') {
        return;
    }

    const currentUri = getOdometerImageUri(image);
    if (!currentUri?.startsWith('blob:')) {
        return;
    }
    const nextUri = getOdometerImageUri(nextImage);
    if (currentUri === nextUri) {
        return;
    }
    URL.revokeObjectURL(currentUri);
}

/**
 * Pure decision helpers for the "resync local odometer readings from the transaction" effect in
 * `IOURequestStepDistanceOdometer`
 *
 * That effect syncs local readings from the transaction without clobbering in-progress typing, and slides the
 * discard-changes baseline when the transaction changes elsewhere (e.g. an edit saved from the confirmation step).
 * Keeping the branching here as pure predicates lets it be unit-tested apart from the effect's ref mutations
 */

type OdometerResyncState = {
    /** Transaction readings normalized to strings ('' when the transaction has no reading) */
    transactionStartValue: string;
    transactionEndValue: string;

    /** Readings currently held in local component state */
    localStartValue: string;
    localEndValue: string;

    /** Whether the transaction carries any odometer reading */
    hasTransactionData: boolean;

    /** Whether local state already holds a reading */
    hasLocalState: boolean;

    /** Whether the on-mount initialization has already run */
    hasInitialized: boolean;

    /** Whether the user has typed changes that aren't written to the transaction yet */
    isUserTyping: boolean;

    /** Whether the screen is in edit mode */
    isEditing: boolean;
};

/**
 * Whether the transaction *readings* changed externally (not from typing here), making them the new readings baseline.
 * Readings-only by design: this slides the readings baseline, so counting image changes would re-baseline still-unsent
 * readings and drop the discard prompt. Images are tracked separately against a never-slid baseline.
 */
function isExternalOdometerResync(state: OdometerResyncState): boolean {
    if (!state.hasTransactionData || !state.hasInitialized || state.isUserTyping) {
        return false;
    }
    return state.transactionStartValue !== state.localStartValue || state.transactionEndValue !== state.localEndValue;
}

/**
 * Whether the local readings should be (re)initialized from the transaction:
 * 1. first mount with transaction data, or
 * 2. editing with transaction data and no local state yet, or
 * 3. transaction has data but local state is empty (navigated back from another page), or
 * 4. an external resync arrived
 *
 * Branches 2-4 carry a `!isUserTyping` guard (inside `isExternalOdometerResync` for branch 4) so they don't
 * re-hydrate readings the user intentionally cleared - which leaves local state empty without writing the
 * transaction, looking identical to "navigated back". Branch 1 is unguarded: a fresh mount must hydrate the baseline.
 */
function shouldInitializeOdometerFromTransaction(state: OdometerResyncState, isExternalResync: boolean): boolean {
    return (
        (!state.hasInitialized && state.hasTransactionData) ||
        (state.isEditing && state.hasTransactionData && !state.hasLocalState && !state.isUserTyping) ||
        (state.hasTransactionData && !state.hasLocalState && state.hasInitialized && !state.isUserTyping) ||
        isExternalResync
    );
}

export {getOdometerImageUri, getOdometerImageName, getOdometerImageType, getOdometerImageIdentity, isExternalOdometerResync, shouldInitializeOdometerFromTransaction};
export type {OdometerResyncState};
export default revokeOdometerImageUri;
