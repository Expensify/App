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

    /** If true, child components are replaced with a blocking view */
    shouldBlockContent: PropTypes.bool,

    /** The key in the translations files to use for the link */
    linkKey: PropTypes.string,

    /** Action to run when clicked on a the link text */
    onLinkPress: PropTypes.func,
};

const defaultProps = {
    children: null,
    shouldBlockContent: undefined,
    linkKey: 'mobilePlacerHolder.goBackHome',
    onLinkPress: () => Navigation.dismissModal(),
};

function LargeDisplayWrapper({linkKey, onLinkPress, children, shouldBlockContent}) {
    const {isSmallScreenWidth} = useWindowDimensions();

    const {translate} = useLocalize();

    const shouldShowBlockingView = _.isBoolean(shouldBlockContent) ? shouldBlockContent : isSmallScreenWidth;

    if (shouldShowBlockingView) {
        return (
            <View style={[styles.blockingViewContainer, styles.flex1]}>
                <BlockingView
                    icon={Illustrations.EmptyStateBiggerScreen}
                    iconWidth={variables.modalTopIconWidth}
                    iconHeight={variables.modalTopIconHeight}
                    title={translate('mobilePlacerHolder.title')}
                    subtitle={translate('mobilePlacerHolder.subTitle')}
                    linkKey={translate(linkKey)}
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
