import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import BlockingView from './BlockingView';
import * as Illustrations from '../Icon/Illustrations';
import HeaderWithBackButton from '../HeaderWithBackButton';
import Navigation from '../../libs/Navigation/Navigation';
import variables from '../../styles/variables';
import styles from '../../styles/styles';
import useLocalize from '../../hooks/useLocalize';

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
    onBackButtonPress: Navigation.goBack,
    shouldShowLink: true,
    shouldShowBackButton: true,
    onLinkPress: () => Navigation.dismissModal(),
};

// eslint-disable-next-line rulesdir/no-negated-variables
function FullPageNotFoundView({children, shouldShow, titleKey, subtitleKey, linkKey, onBackButtonPress, shouldShowLink, shouldShowBackButton, onLinkPress}) {
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
