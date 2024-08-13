import * as pdfjsLib from 'pdfjs-dist';
import type {FileObject} from '@components/AttachmentModal';

const isPdfFilePasswordProtected = (file: FileObject): Promise<boolean> =>
    new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const arrayBuffer = event.target?.result;
            if (!arrayBuffer) {
                resolve(false);
                return;
            }
            try {
                const loadingTask = pdfjsLib.getDocument({data: arrayBuffer});
                loadingTask.promise.then(
                    () => {
                        resolve(false);
                    },
                    (error: Error) => {
                        if (error.name === 'PasswordException') {
                            resolve(true);
                            return;
                        }
                        resolve(false);
                    },
                );
            } catch (error) {
                resolve(false);
            }
        };

        reader.onerror = () => {
            resolve(false);
        };

        reader.readAsArrayBuffer(file as Blob);
    });
export default isPdfFilePasswordProtected;
