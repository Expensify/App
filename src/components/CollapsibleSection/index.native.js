import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import Collapsible from 'react-native-collapsible';
import Text from '../Text';
import {propTypes, defaultProps} from './CollapsibleSectionPropTypes';
import styles from '../../styles/styles';
import Icon from '../Icon';
import {Close, DownArrow} from '../Icon/Expensicons';


class CollapsibleSection extends React.Component {
    constructor(props) {
        super(props);
        this.toggleExpanded = this.toggleExpanded.bind(this);
        this.state = {
            isExpanded: this.props.isExpanded,
        }
    }

    /**
     * Expands/collapses the section
     */
    toggleExpanded() {
        this.setState({isExpanded: !this.state.isExpanded});
    };

    render() {
        // TODO: Get an UpArrow SVG
        const src = this.state.isExpanded ? Close : DownArrow;

        return (
            <View style={[styles.mt4, styles.termsSection]}>
                <TouchableOpacity onPress={this.toggleExpanded} style={[styles.pb4, styles.pl4, styles.flexRow]}>
                    <Text style={styles.flex1}>{this.props.title}</Text>
                    <View style={[styles.mr4]}>
                        <Icon src={src} />
                    </View>
                </TouchableOpacity>
                <Collapsible collapsed={!this.state.isExpanded}>
                    <View>
                        {this.props.children}
                    </View>
                </Collapsible>
            </View>
        );
    }
}

CollapsibleSection.propTypes = propTypes;
CollapsibleSection.defaultProps = defaultProps;
export default CollapsibleSection;
