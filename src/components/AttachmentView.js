import React from 'react';
import {View, Image, Text} from 'react-native';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import styles from '../styles/StyleSheet';
import PDFView from './PDFView';
import ImageView from './ImageView';
import iconFile from '../../assets/images/icon-file.png';

const propTypes = {
    // URL to full-sized attachment
    sourceURL: PropTypes.string.isRequired,

    // Height of image
    imageHeight: PropTypes.number,

    // Width of image
    imageWidth: PropTypes.number,

    file: PropTypes.shape({
        name: PropTypes.string,
    }),
};

const defaultProps = {
    imageHeight: 200,
    imageWidth: 200,
    file: {
        name: 'Unknown Filename',
    }
};

const AttachmentView = (props) => {
    if (Str.isPDF(props.sourceURL)) {
        return (
            <PDFView
                sourceURL={props.sourceURL}
                style={styles.imageModalPDF}
            />
        );
    }

    if (Str.isImage(props.sourceURL)) {
        return (
            <ImageView
                imageWidth={props.imageWidth}
                imageHeight={props.imageHeight}
                sourceURL={props.sourceURL}
            />
        );
    }

    return (
        <View
            style={{
                backgroundColor: '#F8F8F8',
                borderRadius: 4,
                borderWidth: 1,
                borderColor: '#EEEEEE',
                flexDirection: 'row',
                paddingTop: 10,
                paddingBottom: 10,
                paddingRight: 20,
                paddingLeft: 20,
                alignItems: 'center',
            }}
        >
            <Image
                source={iconFile}
                style={{
                    width: 47,
                    height: 60,
                    marginRight: 20,
                }}
            />
            <Text style={styles.textStrong}>{props.file && props.file.name}</Text>
        </View>
    );
};

AttachmentView.propTypes = propTypes;
AttachmentView.defaultProps = defaultProps;
AttachmentView.displayName = 'AttachmentView';

export default AttachmentView;
