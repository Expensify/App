import React from 'react';
import Text from '../Text';
import {View, TouchableOpacity} from 'react-native-web';
import Collapse from 'react-collapse';
import PropTypes from 'prop-types';

const propTypes = {
    // Whether the section should start expanded. False by default
    isExpanded: PropTypes.bool,
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
                        <Text>Test Title</Text>
                    </TouchableOpacity>

                    <Collapse isOpened={this.state.isExpanded}>
                        <View>
                            <Text>Test Content Test Content Test Content Test Content Test Content Test Content Test Content Test Content Test Content Test Content Test Content </Text>
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
