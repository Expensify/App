import PropTypes from 'prop-types';

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
TextFileLink.displayName = 'TextLink';
export default TextFileLink;
