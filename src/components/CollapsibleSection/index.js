import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import Collapsible from './Collapsible';
import Text from '../Text';
import propTypes from './CollapsibleSectionPropTypes';
import styles from '../../styles/styles';
import Icon from '../Icon';
import {DownArrow, UpArrow} from '../Icon/Expensicons';

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
        const src = this.state.isExpanded ? UpArrow : DownArrow;

        return (
            <View style={styles.mt4}>
                <TouchableOpacity onPress={this.toggleSection} style={[styles.pb4, styles.flexRow]}>
                    <Text style={[styles.flex1, styles.textStrong]}>
                        {this.props.title}
                    </Text>
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
