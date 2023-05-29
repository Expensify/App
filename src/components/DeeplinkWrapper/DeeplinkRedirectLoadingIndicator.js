import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import TextLink from '../TextLink';
import Text from '../Text';
import Icon from '../Icon';
import * as Illustrations from '../Icon/Illustrations';
import * as Expensicons from '../Icon/Expensicons';
import colors from '../../styles/colors';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';

const propTypes = {
    openLinkInBrowser: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};

const DeeplinkRedirectLoadingIndicator = (props) => (
    <View style={styles.deeplinkWrapperContainer}>
        <View style={styles.deeplinkWrapperMessage}>
            <View style={styles.mb2}>
                <Icon
                    width={200}
                    height={164}
                    src={Illustrations.RocketBlue}
                />
            </View>
            <Text style={[styles.textHeadline, styles.textXXLarge]}>{props.translate('deeplinkWrapper.launching')}</Text>
            <View style={[styles.mt2, styles.fontSizeNormal, styles.textAlignCenter]}>
                <Text>{props.translate('deeplinkWrapper.redirectedToDesktopApp')}</Text>
                <Text>
                    {props.translate('deeplinkWrapper.youCanAlso')} <TextLink onPress={props.openLinkInBrowser}>{props.translate('deeplinkWrapper.openLinkInBrowser')}</TextLink>.
                </Text>
            </View>
        </View>
        <View style={styles.deeplinkWrapperFooter}>
            <Icon
                width={154}
                height={34}
                fill={colors.green}
                src={Expensicons.ExpensifyWordmark}
            />
        </View>
    </View>
);

DeeplinkRedirectLoadingIndicator.propTypes = propTypes;
DeeplinkRedirectLoadingIndicator.displayName = 'DeeplinkRedirectLoadingIndicator';

export default withLocalize(DeeplinkRedirectLoadingIndicator);
