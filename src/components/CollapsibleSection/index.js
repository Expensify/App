import React from 'react';
import Text from '../Text';
import {View, TouchableOpacity} from 'react-native-web';
import Collapse from 'react-collapse';
import {propTypes, defaultProps} from './CollapsibleSectionPropTypes';

class CollapsibleSection extends React.Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = {
            isExpanded: this.props.isExpanded,
        };
    }

    /**
     * Expands/collapses the section
     */
    toggle() {
        this.setState(prevState => ({
            isExpanded: !prevState.isExpanded
        }));
    }

    render() {
        return (
            <>
                <View>
                    <TouchableOpacity onPress={this.toggle}>
                        <Text>{this.props.title}</Text>
                    </TouchableOpacity>

                    <Collapse isOpened={this.state.isExpanded}>
                        <View>
                            {this.props.children}
                        </View>
                    </Collapse>
                </View>
            </>
        );
    }
}

CollapsibleSection.defaultProps = defaultProps;
CollapsibleSection.propTypes = propTypes;
export default CollapsibleSection;
