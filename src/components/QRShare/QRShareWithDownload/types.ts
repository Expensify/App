type QRShareWithDownloadHandle = {
    download: () => Promise<void> | undefined;
};

export default QRShareWithDownloadHandle;
