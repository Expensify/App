import {View, TouchableOpacity, StyleSheet} from 'react-native';
import Text from '../Text';
import React from 'react';
import Collapsible from 'react-native-collapsible';
import PropTypes from "prop-types";

const propTypes = {
    /** Title of the Collapsible section */
    title: PropTypes.string.isRequired,

    /** Whether the section should start expanded. False by default */
    isExpanded: PropTypes.bool,

    /** Children to display inside the Collapsible component */
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    isExpanded: false,
};

class CollapsibleSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isExpanded: this.props.isExpanded,
        }
    }

    toggleExpanded = () => {
        this.setState({isExpanded: !this.state.isExpanded});
    };

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={this.toggleExpanded}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Single Collapsible</Text>
                    </View>
                </TouchableOpacity>
                <Collapsible collapsed={!this.state.isExpanded} align="center">
                    <View style={styles.content}>
                        {this.props.children}
                    </View>
                </Collapsible>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
        paddingTop: 20,
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
        padding: 20,
        backgroundColor: '#fff',
    },
});

CollapsibleSection.propTypes = propTypes;
CollapsibleSection.defaultProps = defaultProps;
export default CollapsibleSection;
