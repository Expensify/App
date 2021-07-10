import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import Collapsible from 'react-native-collapsible';
import Text from '../Text';
import {propTypes, defaultProps} from './CollapsibleSectionPropTypes';
import styles from '../../styles/styles';

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
        return (
            <View style={styles2.container}>
                <TouchableOpacity onPress={this.toggleExpanded} style={styles.mb4}>
                    <View style={styles2.header}>
                        <Text style={styles2.headerText}>{this.props.title}</Text>
                    </View>
                </TouchableOpacity>
                <Collapsible collapsed={!this.state.isExpanded} align="center">
                    <View style={styles2.content}>
                        {this.props.children}
                    </View>
                </Collapsible>
            </View>
        );
    }
}

const styles2 = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
        paddingTop: 10,
    },
    title: {
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '300',
        marginBottom: 20,
    },
    header: {
        backgroundColor: '#F5FCFF',
        padding: 10,
    },
    headerText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
    },
    content: {
        backgroundColor: '#fff',
    },
});

CollapsibleSection.propTypes = propTypes;
CollapsibleSection.defaultProps = defaultProps;
export default CollapsibleSection;
