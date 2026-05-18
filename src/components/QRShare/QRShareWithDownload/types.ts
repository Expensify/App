import type {ForwardedRef} from 'react';
import type {QRShareProps} from '@components/QRShare/types';

type QRShareWithDownloadHandle = {
    download: () => Promise<void> | undefined;
};

type QRShareWithDownloadProps = Omit<QRShareProps, 'ref'> & {
    ref?: ForwardedRef<QRShareWithDownloadHandle>;
};

export type {QRShareWithDownloadProps, QRShareWithDownloadHandle};
