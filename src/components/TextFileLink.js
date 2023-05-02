import React from 'react';
import PropTypes from 'prop-types';
import {Linking} from 'react-native';

const propTypes = {
    fileName: PropTypes.string,
    textContent: PropTypes.string,
    child: PropTypes.func,
};

const defaultProps = {
    fileName: '',
    textContent: '',
    child: () => {},
};

const TextFileLink = (props) => {
    const downloadFile = () => {
        const blob = new Blob([props.textContent], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);

        // TODO: MOBILE?
        const link = document.createElement('a');
        link.download = `${props.fileName}.txt`;
        link.href = url;
        link.click();
    };

    return props.child(downloadFile);
};

TextFileLink.defaultProps = defaultProps;
TextFileLink.propTypes = propTypes;
TextFileLink.displayName = 'TextLink';
export default TextFileLink;
