import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import _ from 'lodash';
import useLocalize from '../../hooks/useLocalize';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import variables from '../../styles/variables';
import BlockingView from '../BlockingViews/BlockingView';
import * as Illustrations from '../Icon/Illustrations';

const propTypes = {
    /** Child elements */
    children: PropTypes.node,

    /** If true, child components are replaced with a blocking "not found" view */
    shouldShow: PropTypes.bool,

    /** The key in the translations file to use for the title */
    titleKey: PropTypes.string,

    /** The key in the translations file to use for the subtitle */
    subtitleKey: PropTypes.string,

    /** The key in the translations files to use for the link */
    linkKey: PropTypes.string,

    /** Action to run when clicked on a the link text */
    onLinkPress: PropTypes.func,
};

const defaultProps = {
    children: null,
    shouldShow: undefined,
    titleKey: 'mobilePlacerHolder.title',
    subtitleKey: 'mobilePlacerHolder.subTitle',
    linkKey: 'mobilePlacerHolder.goBackHome',
    onLinkPress: () => Navigation.dismissModal(),
};

function LargeDisplayWrapper({titleKey, subtitleKey, linkKey, onLinkPress, children, shouldShow}) {
    const {isSmallScreenWidth} = useWindowDimensions();

    const {translate} = useLocalize();

    // If `shouldShow` is a non-boolean value (no prop passed) default to `isSmallScreenWidth` else follow `shouldShow`
    // Example: `shouldShow` = `undefined` or `null` `isSmallScreenWidth`  will take preference else we follow `shouldShow`
    const shouldShowBlockingView = !_.isBoolean(shouldShow) ? isSmallScreenWidth : shouldShow;

    if (shouldShowBlockingView) {
        return (
            <View style={[styles.blockingViewContainer, styles.flex1]}>
                <BlockingView
                    icon={Illustrations.EmptyStateBiggerScreen}
                    iconWidth={variables.modalTopIconWidth}
                    iconHeight={variables.modalTopIconHeight}
                    title={translate(titleKey)}
                    subtitle={translate(subtitleKey)}
                    linkKey={linkKey}
                    shouldShowLink
                    onLinkPress={onLinkPress}
                />
            </View>
        );
    }
    return children;
}

LargeDisplayWrapper.displayName = 'LargeDisplayWrapper';
LargeDisplayWrapper.propTypes = propTypes;
LargeDisplayWrapper.defaultProps = defaultProps;

export default LargeDisplayWrapper;
