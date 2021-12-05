import React from 'react';
import PropTypes from 'prop-types';
import SignInPageContent from './SignInPageContent';
import SignInPageWideContainer from './SignInPageWideContainer';
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

const SignInPageLayout = (props) => {
    const content = (
        <SignInPageContent
            welcomeText={props.welcomeText}
            shouldShowWelcomeText={props.shouldShowWelcomeText}
        >
            {props.children}
        </SignInPageContent>
    );

    if (props.isSmallScreenWidth) {
        return content;
    }

    return <SignInPageWideContainer>{content}</SignInPageWideContainer>;
};

SignInPageLayout.propTypes = propTypes;
SignInPageLayout.displayName = 'SignInPageLayout';

export default withWindowDimensions(SignInPageLayout);
