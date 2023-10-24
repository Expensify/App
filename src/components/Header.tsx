import React, {ReactElement} from 'react';
import {View, TextStyle} from 'react-native';
import styles from '../styles/styles';
import Text from './Text';
import EnvironmentBadge from './EnvironmentBadge';

type HeaderProps = {
    /** Title of the Header */
    title?: string | ReactElement;

    /** Subtitle of the header */
    subtitle?: string | ReactElement;

    /** Should we show the environment badge (dev/stg)?  */
    shouldShowEnvironmentBadge?: boolean;

    /** Additional text styles */
    textStyles?: TextStyle[];
};

function Header({title = '', subtitle = '', textStyles = [], shouldShowEnvironmentBadge = false}: HeaderProps) {
    return (
        <View style={[styles.flex1, styles.flexRow]}>
            <View style={styles.mw100}>
                {typeof title === 'string'
                    ? Boolean(title) && (
                          <Text
                              numberOfLines={2}
                              style={[styles.headerText, styles.textLarge, ...textStyles]}
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
