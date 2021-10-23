import React from 'react';
import PropTypes from 'prop-types';
import SignInPageLayoutNarrow from './SignInPageLayoutNarrow';
import SignInPageLayoutWide from './SignInPageLayoutWide';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';

const propTypes = {
    /** The children to show inside the layout */
    children: PropTypes.node.isRequired,

    /** Welcome text to show in the header of the form, changes depending
     * on form type (set password, sign in, etc.) */
    welcomeText: PropTypes.string.isRequired,

    /** Whether to show welcome text on a particular page */
    shouldShowWelcomeText: PropTypes.bool.isRequired,

    ...windowDimensionsPropTypes,
};

const SignInPageLayout = props => (
    !props.isSmallScreenWidth
        ? (
            <SignInPageLayoutWide
                welcomeText={props.welcomeText}
                isMediumScreenWidth={props.isMediumScreenWidth}
                shouldShowWelcomeText={props.shouldShowWelcomeText}
            >
                {props.children}
            </SignInPageLayoutWide>
        )
        : (
            <SignInPageLayoutNarrow
                welcomeText={props.welcomeText}
                shouldShowWelcomeText={props.shouldShowWelcomeText}
            >
                {props.children}
            </SignInPageLayoutNarrow>
        )
);

SignInPageLayout.propTypes = propTypes;
SignInPageLayout.displayName = 'SignInPageLayout';

export default withWindowDimensions(SignInPageLayout);
