import React, {ReactElement} from 'react';
import {StyleProp, TextStyle, View} from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';
import EnvironmentBadge from './EnvironmentBadge';
import Text from './Text';

type HeaderProps = {
    /** Title of the Header */
    title?: string | ReactElement;

    /** Subtitle of the header */
    subtitle?: string | ReactElement;

    /** Should we show the environment badge (dev/stg)?  */
    shouldShowEnvironmentBadge?: boolean;

    /** Additional text styles */
    textStyles?: StyleProp<TextStyle>;
};

function Header({title = '', subtitle = '', textStyles = [], shouldShowEnvironmentBadge = false}: HeaderProps) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.flex1, styles.flexRow]}>
            <View style={styles.mw100}>
                {typeof title === 'string'
                    ? Boolean(title) && (
                          <Text
                              numberOfLines={2}
                              style={[styles.headerText, styles.textLarge, textStyles]}
                          >
                              {title}
                          </Text>
                      )
                    : title}
                {/* If there's no subtitle then display a fragment to avoid an empty space which moves the main title */}
                {typeof subtitle === 'string'
                    ? Boolean(subtitle) && (
                          <Text
                              style={[styles.mutedTextLabel, styles.pre]}
                              numberOfLines={1}
                          >
                              {subtitle}
                          </Text>
                      )
                    : subtitle}
            </View>
            {shouldShowEnvironmentBadge && <EnvironmentBadge />}
        </View>
    );
}

Header.displayName = 'Header';

export default Header;
