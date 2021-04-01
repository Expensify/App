import React from 'react';
import SignInPageLayoutNarrow from './SignInPageLayoutNarrow';
import SignInPageLayoutWide from './SignInPageLayoutWide';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const SignInPageLayout = props => (
    !props.isSmallScreenWidth
        // eslint-disable-next-line react/jsx-props-no-spreading
        ? <SignInPageLayoutWide {...props} />
        // eslint-disable-next-line react/jsx-props-no-spreading
        : <SignInPageLayoutNarrow {...props} />
);

SignInPageLayout.propTypes = propTypes;
SignInPageLayout.displayName = 'SignInPageLayout';

export default withWindowDimensions(SignInPageLayout);
