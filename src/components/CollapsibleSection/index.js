import React from 'react';
import {View, TouchableOpacity} from 'react-native-web';
import Collapse from 'react-collapse';
import Text from '../Text';
import {propTypes, defaultProps} from './CollapsibleSectionPropTypes';

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
        return (
            <View>
                <TouchableOpacity onPress={this.toggleExpanded}>
                    <Text>{this.props.title}</Text>
                </TouchableOpacity>

                <Collapse isOpened={this.state.isExpanded}>
                    <View>
                        {this.props.children}
                    </View>
                </Collapse>
            </View>
        );
    }
}

CollapsibleSection.defaultProps = defaultProps;
CollapsibleSection.propTypes = propTypes;
export default CollapsibleSection;
