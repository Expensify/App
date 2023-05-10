import {propTypes, defaultProps} from './textFileLinkPropTypes';

const TextFileLink = (props) => {
    const downloadFile = () => {
        const blob = new Blob([props.textContent], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${props.fileName}.txt`;
        link.href = url;
        link.click();
    };

    return props.children(downloadFile);
};

TextFileLink.defaultProps = defaultProps;
TextFileLink.propTypes = propTypes;
TextFileLink.displayName = 'TextFileLink';
export default TextFileLink;
