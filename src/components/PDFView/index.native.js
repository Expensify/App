import React from 'react';
import PropTypes from 'prop-types';
import {View, Dimensions} from 'react-native';
import Pdf from 'react-native-pdf';
import styles from '../../styles/StyleSheet';

/**
 * On the native layer, we use a pdf library to display PDFs
 *
 * @param props
 * @returns {JSX.Element}
 */

const propTypes = {
    // URL to full-sized image
    sourceURL: PropTypes.string,

    // Any additional styles to apply
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,
};

const defaultProps = {
    sourceURL: '',
    style: {},
};

const PDFView = props => (
    <View style={[styles.flex1, props.style]}>
        <Pdf
            source={{uri: props.sourceURL}}
            style={[
                styles.imageModalPDF,
                {
                    width: Dimensions.get('window').width,
                    height: Dimensions.get('window').height
                }
            ]}
        />
    </View>
);

PDFView.propTypes = propTypes;
PDFView.defaultProps = defaultProps;
PDFView.displayName = 'PDFView';

export default PDFView;
