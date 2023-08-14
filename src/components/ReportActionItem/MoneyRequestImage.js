import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import styles from '../../styles/styles';
import RenderHTML from '../RenderHTML';

const propTypes = {
    /** array of image and thumbnail URIs */
    image: PropTypes.shape({
        thumbnail: PropTypes.string,
        image: PropTypes.string,
    }).isRequired,
};

function MoneyRequestImage(props) {
    return (
        <View style={styles.moneyRequestViewImage}>
            <RenderHTML
                html={`
                <img
                    src="${props.image.thumbnail}"
                    data-expensify-source="${props.image.image}"
                    data-expensify-fit-container="true"
                />
            `}
            />
        </View>
    );
}

MoneyRequestImage.propTypes = propTypes;
MoneyRequestImage.displayName = 'MoneyRequestImage';

export default MoneyRequestImage;
