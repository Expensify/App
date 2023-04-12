
import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import BlockingView from './BlockingView';
import * as Expensicons from '../Icon/Expensicons';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import HeaderWithCloseButton from '../HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
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

    /** Whether we should show a go back home link */
    shouldShowBackHomeLink: PropTypes.bool,

    /** The key in the translations file to use for the go back link */
    linkKey: PropTypes.string,

    /** Method to trigger when pressing the back button of the header */
    onBackButtonPress: PropTypes.func,
};

const defaultProps = {
    children: null,
    shouldShow: false,
    titleKey: 'notFound.notHere',
    subtitleKey: 'notFound.pageNotFound',
    linkKey: 'notFound.goBackHome',
    shouldShowBackButton: true,
    shouldShowBackHomeLink: false,
    shouldShowCloseButton: true,
    onBackButtonPress: () => Navigation.dismissModal(),
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
                        icon={Expensicons.QuestionMark}
                        title={props.translate(props.titleKey)}
                        subtitle={props.translate(props.subtitleKey)}
                        link={props.translate(props.linkKey)}
                        shouldShowBackHomeLink={props.shouldShowBackHomeLink}
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
