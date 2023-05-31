import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import BlockingView from './BlockingView';
import * as Illustrations from '../Icon/Illustrations';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import HeaderWithCloseButton from '../HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import variables from '../../styles/variables';
import styles from '../../styles/styles';

const propTypes = {
    /** Props to fetch translation features */
    ...withLocalizePropTypes,

    /** Child elements */
    children: PropTypes.node,

    /** If true, child components are replaced with a blocking "not found" view */
    shouldShow: PropTypes.bool,

    /** The key in the translations file to use for the title */
    titleKey: PropTypes.string,

    /** The key in the translations file to use for the subtitle */
    subtitleKey: PropTypes.string,

    /** Whether we should show a back icon */
    shouldShowBackButton: PropTypes.bool,

    /** Whether we should show a close button */
    shouldShowCloseButton: PropTypes.bool,

    /** Whether we should show a link to navigate elsewhere */
    shouldShowLink: PropTypes.bool,

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
    shouldShowBackButton: true,
    shouldShowLink: false,
    shouldShowCloseButton: true,
    onBackButtonPress: () => Navigation.dismissModal(),
    onLinkPress: () => Navigation.dismissModal(true),
};

// eslint-disable-next-line rulesdir/no-negated-variables
const FullPageNotFoundView = (props) => {
    if (props.shouldShow) {
        return (
            <>
                <HeaderWithCloseButton
                    shouldShowBackButton={props.shouldShowBackButton}
                    shouldShowCloseButton={props.shouldShowCloseButton}
                    onBackButtonPress={props.onBackButtonPress}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                <View style={[styles.flex1, styles.blockingViewContainer]}>
                    <BlockingView
                        icon={Illustrations.ToddBehindCloud}
                        iconWidth={variables.modalTopIconWidth}
                        iconHeight={variables.modalTopIconHeight}
                        title={props.translate(props.titleKey)}
                        subtitle={props.translate(props.subtitleKey)}
                        link={props.translate(props.linkKey)}
                        shouldShowLink={props.shouldShowLink}
                        onLinkPress={props.onLinkPress}
                    />
                </View>
            </>
        );
    }

    return props.children;
};

FullPageNotFoundView.propTypes = propTypes;
FullPageNotFoundView.defaultProps = defaultProps;
FullPageNotFoundView.displayName = 'FullPageNotFoundView';

export default withLocalize(FullPageNotFoundView);
