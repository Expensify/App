import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Text from '@components/Text';
import styles from '@styles/styles';
import Icon from '@components/Icon';
import CONST from '@src/CONST';
import variables from '@styles/variables';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Header from '@components/Header';
import * as Expensicons from '@components/Icon/Expensicons';

const propTypes = {
    /** Text to display for the item */
    title: PropTypes.string,

    /** Array of pressable breadcrumbs */
    breadcrumbs: PropTypes.arrayOf(PropTypes.string),

    /** Function to fire when component is pressed */
    onPress: PropTypes.func,
};

const defaultProps = {
    title: '',
    breadcrumbs: [],
    onPress: () => {},
};

const HeaderWithBreadcrumbs = React.forwardRef(({title, breadcrumbs, onPress}, ref) => (
    <View style={[styles.flexColum]}>
        <PressableWithFeedback
            onPress={onPress}
            style={styles.breadcrumbContainer}
            ref={ref}
            // accessibilityRole={CONST.ACCESSIBILITY_ROLE.MENUITEM}
            accessibilityLabel={title}
        >
            {_.map(breadcrumbs, (item, index) => (
                <View
                    style={[styles.flexRow, styles.alignItemsCenter]}
                    key={index}
                >
                    {index > 0 && (
                        <Icon
                            src={Expensicons.ArrowRight}
                            additionalStyles={[styles.breadcrumbIcon]}
                            width={variables.iconSizeXXSmall}
                            height={variables.iconSizeXXSmall}
                        />
                    )}
                    <Text style={styles.breadcrumb}>{item}</Text>
                </View>
            ))}
        </PressableWithFeedback>

        <Header
            title={<Text style={styles.textHeadlineH1}>{title}</Text>}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
            shouldShowEnvironmentBadge
        />
    </View>
));

HeaderWithBreadcrumbs.propTypes = propTypes;
HeaderWithBreadcrumbs.defaultProps = defaultProps;
HeaderWithBreadcrumbs.displayName = 'HeaderWithBreadcrumbs';

export default HeaderWithBreadcrumbs;
