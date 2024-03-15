import type {DownloadItem, SaveDialogOptions} from 'electron';

type File = {
    // The name of the file being downloaded
    filename: string;

    // The path where the file is being downloaded to
    path: string;

    // The size of the file being downloaded, in bytes
    fileSize: number;

    // The MIME type of the file being downloaded
    mimeType: string;

    // The URL of the file being downloaded
    url: string;
};
type Options = {
    /**
    Show a `Save As…` dialog instead of downloading immediately.

    Note: Only use this option when strictly necessary. Downloading directly without a prompt is a much better user experience.

    @default false
    */
    readonly saveAs?: boolean;

    /**
    The directory to save the file in.

    Must be an absolute path.

    Default: [User's downloads directory](https://electronjs.org/docs/api/app/#appgetpathname)
    */
    readonly directory?: string;

    /**
    Name of the saved file.
    This option only makes sense for `electronDownloadManager.download()`.

    Default: [`downloadItem.getFilename()`](https://electronjs.org/docs/api/download-item/#downloaditemgetfilename)
    */
    readonly filename?: string;

    /**
    Title of the error dialog. Can be customized for localization.

    Note: Error dialog will not be shown in `electronDownloadManager.download()`. Please handle error manually.

    @default 'Download Error'
    */
    readonly errorTitle?: string;

    /**
    Message of the error dialog. `{filename}` is replaced with the name of the actual file. Can be customized for localization.

    Note: Error dialog will not be shown in `electronDownloadManager.download()`. Please handle error manually.

    @default 'The download of {filename} was interrupted'
    */
    readonly errorMessage?: string;

    /**
    Optional callback that receives the [download item](https://electronjs.org/docs/api/download-item) for which the download has been cancelled.
    */
    readonly onCancel?: (item: DownloadItem) => void;

    /**
    Optional callback that receives an object with information about an item that has been completed. It is called for each completed item.
    */
    readonly onCompleted?: (file: File) => void;

    /**
    Reveal the downloaded file in the system file manager, and if possible, select the file.

    @default false
    */
    readonly openFolderWhenDone?: boolean;

    /**
    Allow downloaded files to overwrite files with the same name in the directory they are saved to.

    The default behavior is to append a number to the filename.

    @default false
    */
    readonly overwrite?: boolean;

    /**
    Customize the save dialog.

    If `defaultPath` is not explicity defined, a default value is assigned based on the file path.

    @default {}
    */
    readonly dialogOptions?: SaveDialogOptions;

    /** Unregister the listener when the download is done. */
    readonly unregisterWhenDone?: boolean;
};

export type {Options, File};
