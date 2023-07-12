import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';
import styles from '../../styles/styles';
import Text from '../Text';
import {checkboxListItemPropTypes} from './selectionListPropTypes';
import Checkbox from '../Checkbox';
import Avatar from '../Avatar';
import OfflineWithFeedback from '../OfflineWithFeedback';
import useLocalize from '../../hooks/useLocalize';

const propTypes = {
    /** The section list item */
    item: PropTypes.shape(checkboxListItemPropTypes),

    /** Whether this item is focused (for arrow key controls) */
    isFocused: PropTypes.bool,

    /** Callback to fire when the item is pressed */
    onSelectRow: PropTypes.func,

    /** Callback to fire when an error is dismissed */
    onDismissError: PropTypes.func,
};

const defaultProps = {
    item: {},
    isFocused: false,
    onSelectRow: () => {},
    onDismissError: () => {},
};

function CheckboxListItem(props) {
    const {translate} = useLocalize();
    const hasError = !_.isEmpty(props.item.errors);

    return (
        <OfflineWithFeedback
            onClose={() => props.onDismissError(props.item)}
            pendingAction={props.item.pendingAction}
            errors={props.item.errors}
            errorRowStyles={styles.ph5}
        >
            <PressableWithFeedback
                style={[styles.peopleRow, styles.userSelectNone, props.isFocused && styles.sidebarLinkActive, hasError && styles.borderColorDanger]}
                onPress={() => props.onSelectRow(props.item)}
                disabled={props.item.isDisabled}
                accessibilityLabel={props.item.text}
                accessibilityRole="checkbox"
                accessibilityState={{checked: props.item.isSelected}}
                hoverDimmingValue={1}
                hoverStyle={styles.hoveredComponentBG}
                focusStyle={styles.hoveredComponentBG}
            >
                <Checkbox
                    accessibilityLabel={props.item.text}
                    disabled={props.item.isDisabled}
                    isChecked={props.item.isSelected}
                    onPress={() => props.onSelectRow(props.item)}
                    style={props.item.isDisabled ? styles.buttonOpacityDisabled : {}}
                />
                {props.item.avatar && (
                    <Avatar
                        containerStyles={styles.pl5}
                        source={props.item.avatar.source}
                        name={props.item.avatar.name}
                        type={props.item.avatar.type}
                    />
                )}
                <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStart, styles.pl3, styles.optionRow]}>
                    <Text
                        style={[styles.optionDisplayName, props.isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, props.item.isSelected && styles.sidebarLinkTextBold]}
                        numberOfLines={1}
                    >
                        {props.item.text}
                    </Text>
                    {Boolean(props.item.alternateText) && (
                        <Text
                            style={[props.isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting]}
                            numberOfLines={1}
                        >
                            {props.item.alternateText}
                        </Text>
                    )}
                </View>
                {props.item.isAdmin && (
                    <View style={[styles.badge, styles.peopleBadge]}>
                        <Text style={[styles.peopleBadgeText]}>{translate('common.admin')}</Text>
                    </View>
                )}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

CheckboxListItem.displayName = 'CheckboxListItem';
CheckboxListItem.propTypes = propTypes;
CheckboxListItem.defaultProps = defaultProps;

export default CheckboxListItem;
