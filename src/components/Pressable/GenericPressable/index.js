import _ from 'underscore';
import GenericPressable from './GenericPressable';
import GenericPressablePropTypes from './PropTypes';

const WebGenericPressable = (props) => {
    // change all props with accessibility* to aria-*
    const accessibilityMappedProps = _.mapKeys(props, (value, key) => {
        if (key === 'nativeID') {
            return 'id';
        }
        if (key === 'accessibilityRole') {
            return 'role';
        }
        if (_.startsWith(key, 'accessibility')) {
            return `aria-${key.slice(13).toLowerCase()}`;
        }
        return key;
    });
    if (!props.accessible || !props.focusable) {
        accessibilityMappedProps.tabIndex = -1;
    }
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <GenericPressable {...accessibilityMappedProps} />;
};

WebGenericPressable.propTypes = GenericPressablePropTypes.propTypes;
WebGenericPressable.defaultProps = GenericPressablePropTypes.defaultProps;

export default WebGenericPressable;
