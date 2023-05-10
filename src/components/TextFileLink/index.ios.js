import {Share} from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import * as FileUtils from '../../libs/fileDownload/FileUtils';
import {propTypes, defaultProps} from './textFileLinkPropTypes';

const TextFileLink = (props) => {
    const downloadFile = () => {
        const dir = RNFetchBlob.fs.dirs.DocumentDir;
        const path = `${dir}/${props.fileName}.txt`;

        RNFetchBlob.fs.writeFile(path, props.textContent, 'utf8').then(() => {
            Share.share({url: path, title: props.fileName})
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
