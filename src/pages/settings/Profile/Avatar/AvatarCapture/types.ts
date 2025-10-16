import type {PropsWithChildren} from 'react';

type AvatarCaptureHandle = {
    /** Captures the avatar view and returns a File/Blob */
    capture: () => Promise<File> | undefined;
};

type AvatarCaptureProps = PropsWithChildren<{
    fileName: string;
}>;

export type {AvatarCaptureHandle, AvatarCaptureProps};
