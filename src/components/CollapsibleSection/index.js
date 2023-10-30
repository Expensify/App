import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import Collapsible from './Collapsible';

const propTypes = {
    /** Title of the Collapsible section */
    title: PropTypes.string.isRequired,

    /** Children to display inside the Collapsible component */
    children: PropTypes.node.isRequired,
};

class CollapsibleSection extends React.Component {
    constructor(props) {
        super(props);
        this.toggleSection = this.toggleSection.bind(this);
        this.state = {
            isExpanded: false,
        };
    }

    /**
     * Expands/collapses the section
     */
    toggleSection() {
        this.setState((prevState) => ({
            isExpanded: !prevState.isExpanded,
        }));
    }

    render() {
        const src = this.state.isExpanded ? Expensicons.UpArrow : Expensicons.DownArrow;

        return (
            <View style={styles.mt4}>
                <PressableWithFeedback
                    onPress={this.toggleSection}
                    style={[styles.pb4, styles.flexRow]}
                    role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                    accessibilityLabel={this.props.title}
                    hoverDimmingValue={1}
                    pressDimmingValue={0.2}
                >
                    <Text
                        style={[styles.flex1, styles.textStrong, styles.userSelectNone]}
                        dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                    >
                        {this.props.title}
                    </Text>
                    <Icon src={src} />
                </PressableWithFeedback>
                <View style={styles.collapsibleSectionBorder} />

                <Collapsible isOpened={this.state.isExpanded}>
                    <View>{this.props.children}</View>
                </Collapsible>
            </View>
        );
    }
}

CollapsibleSection.propTypes = propTypes;
export default CollapsibleSection;
