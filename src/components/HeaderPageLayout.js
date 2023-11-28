import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import {ScrollView, View} from 'react-native';
import _ from 'underscore';
import useNetwork from '@hooks/useNetwork';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import FixedFooter from './FixedFooter';
import HeaderWithBackButton from './HeaderWithBackButton';
import headerWithBackButtonPropTypes from './HeaderWithBackButton/headerWithBackButtonPropTypes';
import ScreenWrapper from './ScreenWrapper';

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

    /** Style to apply to the ScrollView container */
    // eslint-disable-next-line react/forbid-prop-types
    scrollViewContainerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Style to apply to the children container */
    // eslint-disable-next-line react/forbid-prop-types
    childrenContainerStyles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    backgroundColor: undefined,
    header: null,
    headerContainerStyles: [],
    scrollViewContainerStyles: [],
    childrenContainerStyles: [],
    footer: null,
};

function HeaderPageLayout({backgroundColor, children, footer, headerContainerStyles, scrollViewContainerStyles, childrenContainerStyles, style, headerContent, ...propsToPassToHeader}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {windowHeight, isSmallScreenWidth} = useWindowDimensions();
    const {isOffline} = useNetwork();
    const appBGColor = StyleUtils.getBackgroundColorStyle(theme.appBG);
    const {titleColor, iconFill} = useMemo(() => {
        const isColorfulBackground = (backgroundColor || theme.appBG) !== theme.appBG;
        return {
            titleColor: isColorfulBackground ? theme.textColorfulBackground : undefined,
            iconFill: isColorfulBackground ? theme.iconColorfulBackground : undefined,
        };
    }, [backgroundColor, theme.appBG, theme.iconColorfulBackground, theme.textColorfulBackground]);

    return (
        <ScreenWrapper
            style={[StyleUtils.getBackgroundColorStyle(backgroundColor || theme.appBG)]}
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
                                <View style={[styles.flex1, StyleUtils.getBackgroundColorStyle(backgroundColor || theme.appBG)]} />
                                <View style={[isSmallScreenWidth ? styles.flex1 : styles.flex3, appBGColor]} />
                            </View>
                        )}
                        <ScrollView
                            contentContainerStyle={[safeAreaPaddingBottomStyle, style, scrollViewContainerStyles]}
                            offlineIndicatorStyle={[appBGColor]}
                        >
                            {!Browser.isSafari() && <View style={styles.overscrollSpacer(backgroundColor || theme.appBG, windowHeight)} />}
                            <View style={[styles.alignItemsCenter, styles.justifyContentEnd, StyleUtils.getBackgroundColorStyle(backgroundColor || theme.appBG), ...headerContainerStyles]}>
                                {headerContent}
                            </View>
                            <View style={[styles.pt5, appBGColor, childrenContainerStyles]}>{children}</View>
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
