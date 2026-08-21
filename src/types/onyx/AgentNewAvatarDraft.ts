import type AvatarCropResult from './AvatarCropResult';

/** Persisted draft for the new-agent avatar selection flow. */
type AgentNewAvatarDraft = {
    /** Selected preset avatar ID */
    customExpensifyAvatarID?: string;

    /**
     * Uploaded photo in the shared avatar-crop shape (base64 data URL on web, file URI on native) so it
     * survives navigation back to the add screen and a page refresh. Reused verbatim by `buildFileFromAvatarCropResult`.
     */
    uploadedAvatar?: AvatarCropResult;
};

export default AgentNewAvatarDraft;
