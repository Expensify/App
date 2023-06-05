import React from 'react';
import PropTypes from 'prop-types';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import Navigation from '../Navigation';
import styles from '../../../styles/styles';
import PressableWithoutFeedback from '../../../components/Pressable/PressableWithoutFeedback';
import * as Localize from '../../Localize';

const propTypes = {
    /** Whether a modal is currently being displayed */
    isDisplayingModal: PropTypes.bool.isRequired,

    ...windowDimensionsPropTypes,
};

const ClickAwayHandler = (props) => {
    if (!props.isDisplayingModal || props.isSmallScreenWidth) {
        return null;
    }

    return (
        <PressableWithoutFeedback
            style={styles.navigationModalOverlay}
            onPress={() => Navigation.dismissModal()}
            accessibilityRole="button"
            accessibilityLabel={Localize.translateLocal('common.close')}
        />
    );
};

ClickAwayHandler.propTypes = propTypes;
ClickAwayHandler.displayName = 'ClickAwayHandler';
export default withWindowDimensions(ClickAwayHandler);
