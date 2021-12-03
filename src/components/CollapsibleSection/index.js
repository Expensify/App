import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import Collapsible from './Collapsible';
import ExpensifyText from '../ExpensifyText';
import styles from '../../styles/styles';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';

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
        this.setState(prevState => ({
            isExpanded: !prevState.isExpanded,
        }));
    }

    render() {
        const src = this.state.isExpanded ? Expensicons.UpArrow : Expensicons.DownArrow;

        return (
            <View style={styles.mt4}>
                <TouchableOpacity onPress={this.toggleSection} style={[styles.pb4, styles.flexRow]}>
                    <ExpensifyText style={[styles.flex1, styles.textStrong]}>
                        {this.props.title}
                    </ExpensifyText>
                    <Icon src={src} />
                </TouchableOpacity>
                <View style={styles.collapsibleSectionBorder} />

                <Collapsible isOpened={this.state.isExpanded}>
                    <View>
                        {this.props.children}
                    </View>
                </Collapsible>
            </View>
        );
    }
}

CollapsibleSection.propTypes = propTypes;
export default CollapsibleSection;
