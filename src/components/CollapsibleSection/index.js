import React, {useState} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Collapsible from './Collapsible';
import Text from '../Text';
import styles from '../../styles/styles';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';
import CONST from '../../CONST';

const propTypes = {
    /** Title of the Collapsible section */
    title: PropTypes.string.isRequired,

    /** Children to display inside the Collapsible component */
    children: PropTypes.node.isRequired,
};

function CollapsibleSection() {
    const [isExpanded, setIsExpanded] = useState(false);

    function toggleSection() {
        setIsExpanded((prevIsExpanded) => !prevIsExpanded);
    }

    const src = isExpanded ? Expensicons.UpArrow : Expensicons.DownArrow;
    return (
        <View style={styles.mt4}>
            <PressableWithFeedback
                onPress={toggleSection}
                style={[styles.pb4, styles.flexRow]}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                accessibilityLabel={this.props.title}
                hoverDimmingValue={1}
                pressDimmingValue={0.2}
            >
                <Text
                    selectable={false}
                    style={[styles.flex1, styles.textStrong]}
                >
                    {this.props.title}
                </Text>
                <Icon src={src} />
            </PressableWithFeedback>
            <View style={styles.collapsibleSectionBorder} />

            <Collapsible isOpened={.isExpanded}>
                <View>{this.props.children}</View>
            </Collapsible>
        </View>
    );
}

CollapsibleSection.displayName = 'CollapsibleSection';
CollapsibleSection.propTypes = propTypes;
export default CollapsibleSection;
