import type {FileObject} from '@components/AttachmentModal';

function isFileUploadable(file: FileObject | undefined): boolean {
    // Native platforms only require the object to include the `uri` property.
    // Optionally, it can also have a `name` and `type` properties.
    // On other platforms, the file must be an instance of `Blob` or one of its subclasses.
    return !!file && 'uri' in file && !!file.uri && typeof file.uri === 'string';
}

export default isFileUploadable;
