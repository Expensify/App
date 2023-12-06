import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import ROUTES from '@src/ROUTES';
import BlockingView from './BlockingView';

const propTypes = {
    /** Child elements */
    children: PropTypes.node,

    /** If true, child components are replaced with a blocking "not found" view */
    shouldShow: PropTypes.bool,

    /** The key in the translations file to use for the title */
    titleKey: PropTypes.string,

    /** The key in the translations file to use for the subtitle */
    subtitleKey: PropTypes.string,

    /** Whether we should show a link to navigate elsewhere */
    shouldShowLink: PropTypes.bool,

    /** Whether we should show the back button on the header */
    shouldShowBackButton: PropTypes.bool,

    /** The key in the translations file to use for the go back link */
    linkKey: PropTypes.string,

    /** Method to trigger when pressing the back button of the header */
    onBackButtonPress: PropTypes.func,

    /** Function to call when pressing the navigation link */
    onLinkPress: PropTypes.func,
};

const defaultProps = {
    children: null,
    shouldShow: false,
    titleKey: 'notFound.notHere',
    subtitleKey: 'notFound.pageNotFound',
    linkKey: 'notFound.goBackHome',
    onBackButtonPress: () => Navigation.goBack(ROUTES.HOME),
    shouldShowLink: true,
    shouldShowBackButton: true,
    onLinkPress: () => Navigation.dismissModal(),
};

// eslint-disable-next-line rulesdir/no-negated-variables
function FullPageNotFoundView({children, shouldShow, titleKey, subtitleKey, linkKey, onBackButtonPress, shouldShowLink, shouldShowBackButton, onLinkPress}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    if (shouldShow) {
        return (
            <>
                <HeaderWithBackButton
                    onBackButtonPress={onBackButtonPress}
                    shouldShowBackButton={shouldShowBackButton}
                />
                <View style={[styles.flex1, styles.blockingViewContainer]}>
                    <BlockingView
                        icon={Illustrations.ToddBehindCloud}
                        iconWidth={variables.modalTopIconWidth}
                        iconHeight={variables.modalTopIconHeight}
                        title={translate(titleKey)}
                        subtitle={translate(subtitleKey)}
                        linkKey={linkKey}
                        shouldShowLink={shouldShowLink}
                        onLinkPress={onLinkPress}
                    />
                </View>
            </>
        );
    }

    return children;
}

FullPageNotFoundView.propTypes = propTypes;
FullPageNotFoundView.defaultProps = defaultProps;
FullPageNotFoundView.displayName = 'FullPageNotFoundView';

export default FullPageNotFoundView;
