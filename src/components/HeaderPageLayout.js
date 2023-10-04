import _ from 'underscore';
import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import {ScrollView, View} from 'react-native';
import headerWithBackButtonPropTypes from './HeaderWithBackButton/headerWithBackButtonPropTypes';
import HeaderWithBackButton from './HeaderWithBackButton';
import ScreenWrapper from './ScreenWrapper';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import * as StyleUtils from '../styles/StyleUtils';
import useWindowDimensions from '../hooks/useWindowDimensions';
import FixedFooter from './FixedFooter';
import useNetwork from '../hooks/useNetwork';
import * as Browser from '../libs/Browser';

const propTypes = {
    ...headerWithBackButtonPropTypes,

    /** Children to display in the lower half of the page (below the header section w/ an animation) */
    children: PropTypes.node.isRequired,

    /** The background color to apply in the upper half of the screen. */
    backgroundColor: PropTypes.string,

    /** A fixed footer to display at the bottom of the page. */
    footer: PropTypes.node,

    /** The image to display in the upper half of the screen. */
    header: PropTypes.node,

    /** Style to apply to the header image container */
    // eslint-disable-next-line react/forbid-prop-types
    headerContainerStyles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    backgroundColor: themeColors.appBG,
    header: null,
    headerContainerStyles: [],
    footer: null,
};

function HeaderPageLayout({backgroundColor, children, footer, headerContainerStyles, style, headerContent, ...propsToPassToHeader}) {
    const {windowHeight, isSmallScreenWidth} = useWindowDimensions();
    const {isOffline} = useNetwork();
    const appBGColor = StyleUtils.getBackgroundColorStyle(themeColors.appBG);
    const {titleColor, iconFill} = useMemo(() => {
        const isColorfulBackground = backgroundColor !== themeColors.appBG;
        return {
            titleColor: isColorfulBackground ? themeColors.textColorfulBackground : undefined,
            iconFill: isColorfulBackground ? themeColors.iconColorfulBackground : undefined,
        };
    }, [backgroundColor]);

    return (
        <ScreenWrapper
            style={[StyleUtils.getBackgroundColorStyle(backgroundColor)]}
            shouldEnablePickerAvoiding={false}
            includeSafeAreaPaddingBottom={false}
            offlineIndicatorStyle={[appBGColor]}
            testID={HeaderPageLayout.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithBackButton
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...propsToPassToHeader}
                        titleColor={titleColor}
                        iconFill={iconFill}
                    />
                    <View style={[styles.flex1, appBGColor, !isOffline && !_.isNull(footer) ? safeAreaPaddingBottomStyle : {}]}>
                        {/** Safari on ios/mac has a bug where overscrolling the page scrollview shows green background color. This is a workaround to fix that. https://github.com/Expensify/App/issues/23422 */}
                        {Browser.isSafari() && (
                            <View style={styles.dualColorOverscrollSpacer}>
                                <View style={[styles.flex1, StyleUtils.getBackgroundColorStyle(backgroundColor)]} />
                                <View style={[isSmallScreenWidth ? styles.flex1 : styles.flex3, appBGColor]} />
                            </View>
                        )}
                        <ScrollView
                            contentContainerStyle={[safeAreaPaddingBottomStyle, style]}
                            showsVerticalScrollIndicator={false}
                            offlineIndicatorStyle={[appBGColor]}
                        >
                            {!Browser.isSafari() && <View style={styles.overscrollSpacer(backgroundColor, windowHeight)} />}
                            <View style={[styles.alignItemsCenter, styles.justifyContentEnd, StyleUtils.getBackgroundColorStyle(backgroundColor), ...headerContainerStyles]}>
                                {headerContent}
                            </View>
                            <View style={[styles.pt5, appBGColor]}>{children}</View>
                        </ScrollView>
                        {!_.isNull(footer) && <FixedFooter>{footer}</FixedFooter>}
                    </View>
                </>
            )}
        </ScreenWrapper>
    );
}

HeaderPageLayout.propTypes = propTypes;
HeaderPageLayout.defaultProps = defaultProps;
HeaderPageLayout.displayName = 'HeaderPageLayout';

export default HeaderPageLayout;
