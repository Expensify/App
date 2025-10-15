import type {PropsWithChildren} from 'react';

type AvatarCaptureHandle = {
    /** Captures the avatar view and returns a File/Blob */
    capture: () => Promise<File>;
};

type AvatarCaptureProps = PropsWithChildren<{
    name: string;
}>;

export type {AvatarCaptureHandle, AvatarCaptureProps};
