import type {SaveDialogOptions} from 'electron';

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
};

export default Options;
