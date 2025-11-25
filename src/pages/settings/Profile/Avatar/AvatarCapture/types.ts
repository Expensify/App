import type {ForwardedRef, PropsWithChildren} from 'react';

type AvatarCaptureHandle = {
    /** Captures the avatar view and returns a File/Blob */
    capture: () => Promise<File> | undefined;
};

type AvatarCaptureProps = PropsWithChildren<{
    fileName: string;
    ref: ForwardedRef<AvatarCaptureHandle>;
}>;

export type {AvatarCaptureHandle, AvatarCaptureProps};
