import type {ForwardedRef, PropsWithChildren} from 'react';

type AvatarCaptureHandle = {
    /** Captures the avatar view and returns a File/Blob */
    capture: () => Promise<File> | undefined;
};

type AvatarCaptureProps = PropsWithChildren<{
    /** Output filename to use for the captured avatar */
    fileName: string;
    /** Ref used by parents to trigger the capture action */
    ref: ForwardedRef<AvatarCaptureHandle>;
}>;

export type {AvatarCaptureHandle, AvatarCaptureProps};
