import PropTypes from 'prop-types';
import RNFetchBlob from 'react-native-blob-util';
import * as FileUtils from '../../libs/fileDownload/FileUtils';

const propTypes = {
    fileName: PropTypes.string,
    textContent: PropTypes.string,
    children: PropTypes.func,
};

const defaultProps = {
    fileName: '',
    textContent: '',
    children: () => {},
};

const TextFileLink = (props) => {
    const downloadFile = () => {
        const dir = RNFetchBlob.fs.dirs.DocumentDir;
        const path = `${dir}/${props.fileName}.txt`;

        RNFetchBlob.fs.writeFile(path, props.textContent, 'utf8').then(() => {
            RNFetchBlob.MediaCollection.copyToMediaStore(
                {
                    name: props.fileName,
                    parentFolder: '', // subdirectory in the Media Store, empty goes to 'Downloads'
                    mimeType: 'text/plain',
                },
                'Download',
                path,
            )
                .then(() => {
                    FileUtils.showSuccessAlert();
                })
                .catch(() => {
                    FileUtils.showGeneralErrorAlert();
                })
                .finally(() => {
                    RNFetchBlob.fs.unlink(path);
                });
        });
    };

    return props.children(downloadFile);
};

TextFileLink.defaultProps = defaultProps;
TextFileLink.propTypes = propTypes;
TextFileLink.displayName = 'TextFileLink';
export default TextFileLink;
