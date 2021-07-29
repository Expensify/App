import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import Collapsible from './Collapsible';
import Text from '../Text';
import {propTypes, defaultProps} from './CollapsibleSectionPropTypes';
import styles from '../../styles/styles';
import Icon from '../Icon';
import {DownArrow, UpArrow} from '../Icon/Expensicons';

class CollapsibleSection extends React.Component {
    constructor(props) {
        super(props);
        this.toggleExpanded = this.toggleExpanded.bind(this);
        this.state = {
            isExpanded: this.props.isExpanded,
        };
    }

    /**
     * Expands/collapses the section
     */
    toggleExpanded() {
        this.setState(prevState => ({
            isExpanded: !prevState.isExpanded,
        }));
    }

    render() {
        const src = this.state.isExpanded ? UpArrow : DownArrow;

        return (
            <View style={styles.mt4}>
                <TouchableOpacity onPress={this.toggleExpanded} style={[styles.pb4, styles.flexRow]}>
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

CollapsibleSection.defaultProps = defaultProps;
CollapsibleSection.propTypes = propTypes;
export default CollapsibleSection;
