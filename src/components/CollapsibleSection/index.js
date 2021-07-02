import React from 'react';
import Text from '../Text';
import {View, TouchableOpacity} from 'react-native-web';
import Collapse from 'react-collapse';
import PropTypes from 'prop-types';

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
