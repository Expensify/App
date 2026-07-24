import type {QRShareProps} from '@components/QRShare/types';

import type {ForwardedRef} from 'react';

type QRShareWithDownloadHandle = {
    download: () => Promise<void> | undefined;
};

type QRShareWithDownloadProps = Omit<QRShareProps, 'ref'> & {
    ref?: ForwardedRef<QRShareWithDownloadHandle>;
};

export type {QRShareWithDownloadProps, QRShareWithDownloadHandle};
