import React from 'react';
import Text from '../Text';
import {View, TouchableOpacity} from 'react-native-web';
import Collapse from 'react-collapse';
import _ from 'underscore';
import PropTypes from 'prop-types';

const BACON_IPSUM =
    'Bacon ipsum dolor amet chuck turducken landjaeger tongue spare ribs. Picanha beef prosciutto meatball turkey shoulder shank salami cupim doner jowl pork belly cow. Chicken shankle rump swine tail frankfurter meatloaf ground round flank ham hock tongue shank andouille boudin brisket. ';

const CONTENT = [
    {
        title: 'First',
        content: BACON_IPSUM,
    },
    {
        title: 'Second',
        content: BACON_IPSUM,
    },
    {
        title: 'Third',
        content: BACON_IPSUM,
    },
    {
        title: 'Fourth',
        content: BACON_IPSUM,
    },
    {
        title: 'Fifth',
        content: BACON_IPSUM,
    },
];

const propTypes = {
    // Whether the section should start expanded. False by default
    isExpanded: PropTypes.bool,

    // Callback to fire when the section is expanded
    onExpand: PropTypes.func,
};

const defaultProps = {
    isExpanded: false,
    onExpand: () => {},
};

class AccordionView extends React.Component {
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
        }), () => {
            if (this.state.isExpanded) {
                this.props.onExpand();
            }
        });
    }

    render() {
        return (
            <>
                {_.map(CONTENT, section => (
                    <View>
                        <TouchableOpacity onPress={this.toggle}>
                            <Text>{section.title}</Text>
                        </TouchableOpacity>

                        <Collapse isOpened={this.state.isExpanded}>
                            <View>
                                <Text>{section.content}</Text>
                            </View>
                        </Collapse>
                    </View>
                ))}
            </>
        );
    }
}

AccordionView.defaultProps = defaultProps;
export default AccordionView;
