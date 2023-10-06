import PropTypes from 'prop-types';
import Navigation from '../../libs/Navigation/Navigation';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import * as Illustrations from '../Icon/Illustrations';
import variables from '../../styles/variables';
import {View} from 'react-native';
import React from 'react';
import styles from '../../styles/styles';
import useLocalize from '../../hooks/useLocalize';
import BlockingView from '../BlockingViews/BlockingView';

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

function TempPlaceHolder({titleKey, subtitleKey, linkKey, onLinkPress, children, shouldShow}) {
    const {isSmallScreenWidth} = useWindowDimensions();

    const {translate} = useLocalize();

    console.log(translate('mobilePlacerHolder.subTitle'), 'ib');

    if (shouldShow || isSmallScreenWidth) {
        return (
            <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.ph10]}>
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

TempPlaceHolder.displayName = 'PlaceHolder';
TempPlaceHolder.propTypes = propTypes;
TempPlaceHolder.defaultProps = defaultProps;

export default TempPlaceHolder;
