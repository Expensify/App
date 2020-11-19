import React from 'react';
import PropTypes from 'prop-types';
import {View, Dimensions} from 'react-native';
import PDF from 'react-native-pdf';
import styles from '../../styles/StyleSheet';

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

/**
 * On the native layer, we use a pdf library to display PDFs
 *
 * @param props
 * @returns {JSX.Element}
 */

const PDFView = props => (
    <View style={[styles.flex1, props.style]}>
        <PDF
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
