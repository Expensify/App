import React, {useRef} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../Text';
import SelectCircle from '../SelectCircle';
import styles from '../../styles/styles';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';
import OfflineWithFeedback from '../OfflineWithFeedback';

const propTypes = {
    item: PropTypes.shape({
        text: PropTypes.string,
    }).isRequired,
    isDisabled: PropTypes.bool,
    isSelected: PropTypes.bool,
    onPress: PropTypes.func.isRequired,
};

const defaultProps = {
    isDisabled: false,
    isSelected: false,
};

const SelectionListItemSingle = (props) => {
    const pressableRef = useRef(null);

    return (
        <OfflineWithFeedback
            pendingAction={props.item.pendingAction} //TODO: REVIEW
            errors={props.item.allReportErrors} //TODO: REVIEW
            shouldShowErrorMessages={false}
        >
            <PressableWithFeedback
                ref={pressableRef}
                accessibilityLabel={props.item.text}
                accessibilityRole="button"
                style={[styles.sidebarLinkInner]}
                hoverStyle={styles.hoveredComponentBG}
                focusStyle={styles.hoveredComponentBG}
                hoverDimmingValue={1}
                disabled={props.isDisabled}
                onPress={() => props.onPress(props.item)}
            >
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.optionRow]}>
                    {props.item.text ? (
                        <View style={[styles.flexWrap, styles.pl2]}>
                            <Text style={[styles.textLabel]}>{props.item.text}</Text>
                        </View>
                    ) : null}
                    <SelectCircle isChecked={props.isSelected} />
                </View>
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
};

SelectionListItemSingle.displayName = 'SelectionListItemSingle';
SelectionListItemSingle.defaultProps = defaultProps;
SelectionListItemSingle.propTypes = propTypes;

export default SelectionListItemSingle;
