import React from 'react';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';
import ClickAwayHandler from './ClickAwayHandler';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const ClickAwayHandlerWithWindowDimensions = (props) => {
    if (props.isSmallScreenWidth) {
        return null;
    }

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ClickAwayHandler {...props} />;
};

ClickAwayHandlerWithWindowDimensions.propTypes = propTypes;
ClickAwayHandlerWithWindowDimensions.displayName = 'ClickAwayHandlerWithWindowDimensions';
export default withWindowDimensions(ClickAwayHandlerWithWindowDimensions);
