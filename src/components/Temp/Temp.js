import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
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
    shouldShow: false,
    titleKey: 'mobilePlacerHolder.title',
    subtitleKey: 'mobilePlacerHolder.subTitle',
    linkKey: 'mobilePlacerHolder.goBackHome',
    onLinkPress: () => Navigation.dismissModal(),
};

function Temp({titleKey, subtitleKey, linkKey, onLinkPress, children, shouldShow}) {
    const {isSmallScreenWidth} = useWindowDimensions();

    const {translate} = useLocalize();

    if (shouldShow || isSmallScreenWidth) {
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

Temp.displayName = 'PlaceHolder';
Temp.propTypes = propTypes;
Temp.defaultProps = defaultProps;

export default Temp;
