import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {base64ToFile, convertFileObjectOrUriToBase64DataURL} from '@libs/fileDownload/FileUtils';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import revokeOdometerImageUri, {getOdometerImageUri} from '@libs/OdometerImageUtils';
import CONST from '@src/CONST';
import type {OdometerImageType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OdometerDraft, Transaction} from '@src/types/onyx';
import type {Comment} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import {setMoneyRequestReceipt} from './IOU/Receipt';
import {removeBackupTransaction} from './TransactionEdit';

type SaveOdometerDraftParams = {
    startReading?: number;
    endReading?: number;
    startImage?: FileObject | string | null;
    endImage?: FileObject | string | null;
};

/**
 * Set the odometer readings for a transaction.
 */
function setMoneyRequestOdometerReading(transactionID: string, startReading: number | null, endReading: number | null, isDraft: boolean) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        comment: {
            odometerStart: startReading,
            odometerEnd: endReading,
        },
    });
}

/**
 * Set odometer image for a transaction
 * @param transaction - The transaction or transaction draft
 * @param imageType - 'start' or 'end'
 * @param file - The image file (File object on web, URI string on native)
 * @param isDraft - Whether this is a draft transaction
 * @param shouldRevokeOldImage - Whether to revoke the previous blob URL immediately (always false on native where blob URLs don't exist; false on web when a backup transaction exists making the caller responsible for revoking)
 */
function setMoneyRequestOdometerImage(transaction: OnyxEntry<Transaction>, imageType: OdometerImageType, file: FileObject | string, isDraft: boolean, shouldRevokeOldImage: boolean) {
    const imageKey = imageType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? 'odometerStartImage' : 'odometerEndImage';
    const normalizedFile: FileObject | string =
        typeof file === 'string'
            ? file
            : {
                  uri: file.uri ?? (typeof URL !== 'undefined' ? URL.createObjectURL(file as Blob) : undefined),
                  name: file.name,
                  type: file.type,
                  size: file.size,
              };
    const transactionID = transaction?.transactionID;
    const existingImage = transaction?.comment?.[imageKey];
    if (shouldRevokeOldImage) {
        revokeOdometerImageUri(existingImage, normalizedFile);
    }
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        comment: {
            [imageKey]: normalizedFile,
        },
    });
}

/**
 * Remove odometer image from a transaction
 * @param transaction - The transaction or transaction draft
 * @param imageType - 'start' or 'end'
 * @param isDraft - Whether this is a draft transaction
 * @param shouldRevokeOldImage - Whether to revoke the previous blob URL immediately (always false on native where blob URLs don't exist; false on web when a backup transaction exists making the caller responsible for revoking)
 */
function removeMoneyRequestOdometerImage(transaction: OnyxEntry<Transaction>, imageType: OdometerImageType, isDraft: boolean, shouldRevokeOldImage: boolean) {
    if (!transaction?.transactionID) {
        return;
    }
    const imageKey = imageType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? 'odometerStartImage' : 'odometerEndImage';
    const existingImage = transaction?.comment?.[imageKey];
    if (shouldRevokeOldImage) {
        revokeOdometerImageUri(existingImage);
    }
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transaction?.transactionID}`, {
        comment: {
            [imageKey]: null,
        },
    });
}

function clearOdometerDraftTransactionState(transaction: OnyxEntry<Transaction>): void {
    if (!transaction) {
        return;
    }
    setMoneyRequestReceipt(transaction.transactionID, '', '', true);
    setMoneyRequestOdometerReading(transaction.transactionID, null, null, true);
    removeMoneyRequestOdometerImage(transaction, CONST.IOU.ODOMETER_IMAGE_TYPE.START, true, true);
    removeMoneyRequestOdometerImage(transaction, CONST.IOU.ODOMETER_IMAGE_TYPE.END, true, true);
    removeBackupTransaction(transaction.transactionID);
}

function clearOdometerDraft(): Promise<void> {
    return Onyx.set(ONYXKEYS.ODOMETER_DRAFT, null);
}

async function serializeOdometerDraftImage(image: FileObject | string | null | undefined): Promise<string | undefined> {
    if (!image) {
        return undefined;
    }

    const imageURI = getOdometerImageUri(image);
    if (!imageURI) {
        return undefined;
    }

    if (getPlatform() !== CONST.PLATFORM.WEB) {
        return imageURI;
    }

    try {
        return await convertFileObjectOrUriToBase64DataURL(image);
    } catch (error) {
        Log.warn('Failed to serialize odometer draft image to base64', {error});
        return imageURI;
    }
}

function deserializeOdometerDraftImage(image: string | undefined, transactionID: string, imageType: OdometerImageType): FileObject | string | undefined {
    if (!image) {
        return undefined;
    }

    if (getPlatform() !== CONST.PLATFORM.WEB || !image.startsWith('data:')) {
        return image;
    }

    try {
        const file = base64ToFile(image, `odometer-${imageType}-${transactionID}.png`);
        return {
            uri: file.uri,
            name: file.name,
            type: file.type,
            size: file.size,
        };
    } catch (error) {
        Log.warn('Failed to deserialize odometer draft image from base64', {error});
        return image;
    }
}

async function saveOdometerDraft({startReading, endReading, startImage, endImage}: SaveOdometerDraftParams): Promise<void> {
    const [serializedStartImage, serializedEndImage] = await Promise.all([serializeOdometerDraftImage(startImage), serializeOdometerDraftImage(endImage)]);
    const hasDraftData = startReading !== undefined || endReading !== undefined || !!serializedStartImage || !!serializedEndImage;

    if (!hasDraftData) {
        await clearOdometerDraft();
        return;
    }

    const odometerDraft: OdometerDraft = {
        ...(startReading !== undefined && {odometerStartReading: startReading}),
        ...(endReading !== undefined && {odometerEndReading: endReading}),
        ...(serializedStartImage && {odometerStartImage: serializedStartImage}),
        ...(serializedEndImage && {odometerEndImage: serializedEndImage}),
    };

    await Onyx.set(ONYXKEYS.ODOMETER_DRAFT, odometerDraft);
}

type OdometerCommentUpdate = {
    odometerStart: number | null;
    odometerEnd: number | null;
    odometerStartImage: FileObject | string | null;
    odometerEndImage: FileObject | string | null;
};

function buildOdometerCommentFromDraft(transactionID: string, odometerDraft: OnyxEntry<OdometerDraft>, currentComment?: Partial<Comment>): OdometerCommentUpdate | undefined {
    if (!odometerDraft) {
        return;
    }

    const startImage = deserializeOdometerDraftImage(odometerDraft.odometerStartImage, transactionID, CONST.IOU.ODOMETER_IMAGE_TYPE.START) ?? null;
    const endImage = deserializeOdometerDraftImage(odometerDraft.odometerEndImage, transactionID, CONST.IOU.ODOMETER_IMAGE_TYPE.END) ?? null;

    // Free the previous blob URL before the merge drops the reference - covers both replace and wipe-to-null; helper no-ops if non-blob or unchanged.
    revokeOdometerImageUri(currentComment?.odometerStartImage, startImage);
    revokeOdometerImageUri(currentComment?.odometerEndImage, endImage);

    return {
        odometerStart: odometerDraft.odometerStartReading ?? null,
        odometerEnd: odometerDraft.odometerEndReading ?? null,
        odometerStartImage: startImage,
        odometerEndImage: endImage,
    };
}

/**
 * Idempotent hydration of a saved-for-later odometer draft into a transaction's comment.
 * Called when the user lands on the DISTANCE_ODOMETER flow (tab change or initial mount on the
 * odometer tab) so blob URLs can be re-minted from the persisted base64 after a page refresh.
 * Returns silently when the draft is empty or the comment already reflects it.
 */
function hydrateOdometerDraftIntoTransaction(transactionID: string, odometerDraft: OnyxEntry<OdometerDraft>, currentComment?: Partial<Comment>): void {
    const update = buildOdometerCommentFromDraft(transactionID, odometerDraft, currentComment);
    if (!update) {
        return;
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {comment: update});
}

/**
 * True when an ODOMETER_DRAFT exists but the transaction comment hasn't received it yet (hydration pending) -
 * used to defer the baseline snapshot and gate the hydration effect
 */
function isOdometerDraftPendingHydration(odometerDraft: OnyxEntry<OdometerDraft>, comment: Partial<Comment> | undefined): boolean {
    if (!odometerDraft) {
        return false;
    }
    const startPending = odometerDraft.odometerStartReading !== undefined && (comment?.odometerStart ?? null) === null;
    const endPending = odometerDraft.odometerEndReading !== undefined && (comment?.odometerEnd ?? null) === null;
    const draftCarriesReadings = odometerDraft.odometerStartReading !== undefined || odometerDraft.odometerEndReading !== undefined;
    const startImagePending = !draftCarriesReadings && !!odometerDraft.odometerStartImage && !comment?.odometerStartImage;
    const endImagePending = !draftCarriesReadings && !!odometerDraft.odometerEndImage && !comment?.odometerEndImage;
    return startPending || endPending || startImagePending || endImagePending;
}

type OdometerUnsavedChangesState = {
    /** Discard guard active: focused && !editing && no bypass/save/manual-backup flags. */
    isGuardActive: boolean;

    /** Whether the reading text inputs hold values not yet written to the transaction (mid-edit typing). */
    isUserTyping: boolean;

    /** The active save-for-later draft, if any. */
    odometerDraft: OnyxEntry<OdometerDraft>;

    /** The comment of currentTransaction (split draft when editing a split, else the transaction) - used ONLY for the directional hydration check. */
    currentComment: Partial<Comment> | undefined;

    /** Re-mint-invariant start/end image identities (getOdometerImageIdentity) from the live transaction comment. */
    transactionStartImageUri: string;
    transactionEndImageUri: string;

    /** Re-mint-invariant start/end image identities captured in the on-mount baseline refs. */
    baselineStartImageUri: string;
    baselineEndImageUri: string;

    /** Whether the readings differ from the on-mount baseline. */
    hasReadingChanges: boolean;
};

/**
 * Decide whether the odometer screen has unsaved changes that warrant a "Discard changes?" prompt.
 * Images diff on a re-mint-invariant identity (name|size) so a non-user blob re-mint doesn't register, and the
 * typing guard does the same for readings. See the draft-suppression clause below for the directional caveat
 */
function getOdometerHasUnsavedChanges(state: OdometerUnsavedChangesState): boolean {
    if (!state.isGuardActive) {
        return false;
    }
    const hasImageChanges = state.transactionStartImageUri !== state.baselineStartImageUri || state.transactionEndImageUri !== state.baselineEndImageUri;
    // Suppress only when the transaction still EQUALS the draft (spurious baseline drift, not a genuine edit).
    // isOdometerDraftPendingHydration is directional, so it can't catch a transaction that moved AHEAD of the draft
    // (changed reading + Next, no re-save) - this reading-equality check and the typing guard do
    const draftReadingsMatchTransaction =
        (state.odometerDraft?.odometerStartReading ?? null) === (state.currentComment?.odometerStart ?? null) &&
        (state.odometerDraft?.odometerEndReading ?? null) === (state.currentComment?.odometerEnd ?? null);
    if (!state.isUserTyping && !hasImageChanges && !!state.odometerDraft && draftReadingsMatchTransaction && !isOdometerDraftPendingHydration(state.odometerDraft, state.currentComment)) {
        return false;
    }
    return state.hasReadingChanges || hasImageChanges;
}

export {
    setMoneyRequestOdometerReading,
    setMoneyRequestOdometerImage,
    removeMoneyRequestOdometerImage,
    clearOdometerDraft,
    saveOdometerDraft,
    hydrateOdometerDraftIntoTransaction,
    isOdometerDraftPendingHydration,
    getOdometerHasUnsavedChanges,
};
export type {OdometerUnsavedChangesState};
export default clearOdometerDraftTransactionState;
