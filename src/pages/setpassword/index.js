import React from 'react';
import SetPasswordPageWide from './SetPasswordPageWide';
import SetPasswordPageNarrow from './SetPasswordPageNarrow';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import setPasswordPagePropTypes from './setPasswordPagePropTypes';

const propTypes = {
    ...windowDimensionsPropTypes,
    ...setPasswordPagePropTypes.propTypes,
};

const SetPasswordPage = props => (
    !props.isSmallScreenWidth
        // eslint-disable-next-line react/jsx-props-no-spreading
        ? <SetPasswordPageWide {...props} />
        // eslint-disable-next-line react/jsx-props-no-spreading
        : <SetPasswordPageNarrow {...props} />
);

SetPasswordPage.propTypes = propTypes;
SetPasswordPage.defaultProps = setPasswordPagePropTypes.defaultProps;

export default withWindowDimensions(SetPasswordPage);
