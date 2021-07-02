import {View, TouchableOpacity, StyleSheet} from 'react-native';
import Text from '../Text';
import React from 'react';
import Collapsible from 'react-native-collapsible';

class CollapsibleSection extends React.Component {
    state = {
        collapsed: true,
    };

    toggleExpanded = () => {
        this.setState({ collapsed: !this.state.collapsed });
    };

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={this.toggleExpanded}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Single Collapsible</Text>
                    </View>
                </TouchableOpacity>
                <Collapsible collapsed={this.state.collapsed} align="center">
                    <View style={styles.content}>
                        <Text>
                            Bacon ipsum dolor amet chuck turducken landjaeger tongue spare
                            ribs
                        </Text>
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

export default CollapsibleSection;
