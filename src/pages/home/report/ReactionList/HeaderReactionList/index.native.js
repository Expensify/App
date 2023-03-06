import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../../../styles/styles';
import compose from '../../../../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../../../../components/withLocalize';
import {withPersonalDetails} from '../../../../../components/OnyxProvider';
import Text from '../../../../../components/Text';
import Icon from '../../../../../components/Icon';
import * as Expensicons from '../../../../../components/Icon/Expensicons';

const propTypes = {
    /** Children view component for this action item */
    onClose: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};

const HeaderReactionList = props => (
    <View style={[styles.flexRow, styles.ph5, styles.pt4, styles.justifyContentBetween, styles.alignItemsCenter]}>
        <Text numberOfLines={2} style={[styles.headerText, styles.textLarge]}>
            Emoji reactions
        </Text>
        <TouchableOpacity
            onPress={props.onClose}
            accessibilityRole="button"
            accessibilityLabel={props.translate('common.close')}
        >
            <Icon src={Expensicons.Close} />
        </TouchableOpacity>
    </View>
);

HeaderReactionList.propTypes = propTypes;
HeaderReactionList.displayName = 'HeaderReactionList';

export default compose(
    withLocalize,
    withPersonalDetails(),
)(HeaderReactionList);

