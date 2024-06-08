import * as pdfjsLib from 'pdfjs-dist/build/pdf';

const isPdfFilePasswordProtected = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            const arrayBuffer = event.target?.result;

            try {
                const loadingTask = pdfjsLib.getDocument({data: arrayBuffer});
                loadingTask.promise.then(
                    () => {
                        resolve(false);
                    },
                    (error) => {
                        console.log('***********', error);
                        if (error.name === 'PasswordException') {
                            resolve(true);
                        } else {
                            reject(error);
                        }
                    },
                );
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
};

export default isPdfFilePasswordProtected;
