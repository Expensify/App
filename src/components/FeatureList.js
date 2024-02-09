import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import stylePropTypes from '@styles/stylePropTypes';
import variables from '@styles/variables';
import Button from './Button';
import MenuItem from './MenuItem';
import menuItemPropTypes from './menuItemPropTypes';
import Section from './Section';

const propTypes = {
    /** The text to display in the title of the section */
    title: PropTypes.string.isRequired,

    /** The text to display in the subtitle of the section */
    subtitle: PropTypes.string,

    /** Text of the call to action button */
    ctaText: PropTypes.string,

    /** Accessibility label for the call to action button */
    ctaAccessibilityLabel: PropTypes.string,

    /** Action to call on cta button press */
    onCTAPress: PropTypes.func,

    /** A list of menuItems representing the feature list. */
    menuItems: PropTypes.arrayOf(PropTypes.shape({...menuItemPropTypes, translationKey: PropTypes.string})).isRequired,

    /** The illustration to display in the header. Can be a JSON object representing a Lottie animation. */
    illustration: PropTypes.shape({
        file: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        w: PropTypes.number.isRequired,
        h: PropTypes.number.isRequired,
    }),

    /** The style passed to the illustration */
    illustrationStyle: stylePropTypes,

    /** The background color to apply in the upper half of the screen. */
    illustrationBackgroundColor: PropTypes.string,
};

const defaultProps = {
    ctaText: '',
    ctaAccessibilityLabel: '',
    subtitle: '',
    onCTAPress: () => {},
    illustration: null,
    illustrationBackgroundColor: '',
    illustrationStyle: [],
};

function FeatureList({title, subtitle, ctaText, ctaAccessibilityLabel, onCTAPress, menuItems, illustration, illustrationStyle, illustrationBackgroundColor}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Section
            title={title}
            subtitle={subtitle}
            isCentralPane
            subtitleMuted
            illustration={illustration}
            illustrationBackgroundColor={illustrationBackgroundColor}
            illustrationStyle={illustrationStyle}
        >
            <View style={styles.flex1}>
                <View style={[styles.flex1, styles.flexRow, styles.flexWrap, styles.rowGap4, styles.pv4, styles.pl1]}>
                    {_.map(menuItems, ({translationKey, icon}) => (
                        <View
                            key={translationKey}
                            style={styles.w100}
                        >
                            <MenuItem
                                title={translate(translationKey)}
                                icon={icon}
                                iconWidth={variables.avatarSizeMedium}
                                iconHeight={variables.avatarSizeMedium}
                                iconStyles={styles.mr2}
                                interactive={false}
                                displayInDefaultIconColor
                                wrapperStyle={[styles.p0, styles.cursorAuto]}
                                containerStyle={[styles.m0, styles.wAuto]}
                            />
                        </View>
                    ))}
                </View>
                <Button
                    text={ctaText}
                    onPress={onCTAPress}
                    accessibilityLabel={ctaAccessibilityLabel}
                    style={[styles.w100]}
                    success
                />
            </View>
        </Section>
    );
}

FeatureList.propTypes = propTypes;
FeatureList.defaultProps = defaultProps;
FeatureList.displayName = 'FeatureList';

export default FeatureList;
