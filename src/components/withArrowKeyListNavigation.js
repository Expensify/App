import _ from 'underscore';
import React, {Component, forwardRef} from 'react';
import PropTypes from 'prop-types';
import CONST from '../CONST';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import KeyboardShortcut from '../libs/KeyboardShortcut';
import * as NumberUtils from '../libs/NumberUtils';

const defaultConfig = {
    initialFocusedIndex: 0,
    listLength: 0,
    onFocusedIndexChanged: () => {},
};

/**
 * Validates the configuration parameters to this HOC.
 *
 * @param {Object} config
 * @throws {Error}
 */
function validateConfig(config = {}) {
    if (!_.isObject(config) || _.isEmpty(config)) {
        throw new Error('withArrowKeyListTraversal: config is not valid');
    }

    const {initialFocusedIndex, listLength, onFocusedIndexChanged} = config;

    if (initialFocusedIndex && !NumberUtils.isWholeNumber(initialFocusedIndex)) {
        throw new Error('withArrowKeyListTraversal: initialFocusedIndex parameter must be a whole number');
    }

    if (listLength && !NumberUtils.isWholeNumber(listLength)) {
        throw new Error('withArrowKeyListTraversal: listLength parameter must be a whole number');
    }

    if (onFocusedIndexChanged && !_.isFunction(onFocusedIndexChanged)) {
        throw new Error('withArrowKeyListTraversal: onFocusedIndexChanges parameter must be a function');
    }
}

/**
 * @param {Object} [config]
 * @param {Number} [config.initialFocusedIndex]
 * @param {Number} [config.listLength]
 * @param {Number} [config.onFocusedIndexChanged]
 * @returns {Function}
 */
const withArrowKeyListTraversal = (config = defaultConfig) => {
    validateConfig(config);
    return (
        (WrappedComponent) => {
            const propTypes = {
                forwardedRef: PropTypes.oneOfType([
                    PropTypes.func,
                    PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
                ]),
            };

            const defaultProps = {
                forwardedRef: undefined,
            };

            class WithArrowKeyListTraversal extends Component {
                constructor(props) {
                    super(props);

                    this.state = {
                        focusedIndex: config.initialFocusedIndex,
                    };
                }

                componentDidMount() {
                    const arrowUpConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_UP;
                    const arrowDownConfig = CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN;

                    this.unsubscribeArrowUpKeyHandler = KeyboardShortcut.subscribe(arrowUpConfig.shortcutKey, () => {
                        if (config.listLength <= 1) {
                            return;
                        }

                        this.setState(
                            (prevState) => {
                                let newFocusedIndex = prevState.focusedIndex - 1;

                                // Wrap around to the bottom of the list
                                if (newFocusedIndex < 0) {
                                    newFocusedIndex = config.listLength - 1;
                                }

                                return {focusedIndex: newFocusedIndex};
                            },
                            () => config.onFocusedIndexChanged(this.state.focusedIndex),
                        );
                    }, arrowUpConfig.descriptionKey, arrowUpConfig.modifiers, true);

                    this.unsubscribeArrowDownKeyHandler = KeyboardShortcut.subscribe(arrowDownConfig.shortcutKey, () => {
                        if (config.listLength <= 1) {
                            return;
                        }

                        this.setState(
                            (prevState) => {
                                let newFocusedIndex = prevState.focusedIndex + 1;

                                // Wrap around to the top of the list
                                if (newFocusedIndex > config.listLength - 1) {
                                    newFocusedIndex = 0;
                                }

                                return {focusedIndex: newFocusedIndex};
                            },
                            () => config.onFocusedIndexChanged(this.state.focusedIndex),
                        );
                    }, arrowDownConfig.descriptionKey, arrowDownConfig.modifiers, true);
                }

                componentWillUnmount() {
                    if (this.unsubscribeArrowUpKeyHandler) {
                        this.unsubscribeArrowUpKeyHandler();
                    }

                    if (this.unsubscribeArrowDownKeyHandler) {
                        this.unsubscribeArrowDownKeyHandler();
                    }
                }

                render() {
                    return (
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        <WrappedComponent {...this.props} ref={this.props.forwardedRef} />
                    );
                }
            }

            WithArrowKeyListTraversal.propTypes = propTypes;
            WithArrowKeyListTraversal.defaultProps = defaultProps;
            WithArrowKeyListTraversal.displayName = `withArrowKeyListTraversal(${getComponentDisplayName(WrappedComponent)})`;

            return forwardRef((ref, props) => (
                // eslint-disable-next-line react/jsx-props-no-spreading
                <WithArrowKeyListTraversal {...props} forwardedRef={ref} />
            ));
        }
    );
};

export default withArrowKeyListTraversal;
