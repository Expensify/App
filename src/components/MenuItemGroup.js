import useSingleExecution from '@hooks/useSingleExecution';
import PropTypes from 'prop-types';
import React, {Children, cloneElement} from 'react';

const propTypes = {
    /* Actual content wrapped by this component */
    children: PropTypes.node.isRequired,

    /** Whether or not to use the single execution hook */
    shouldUseSingleExecution: PropTypes.bool,
};
const defaultProps = {
    shouldUseSingleExecution: true
};

function MenuItemGroup(props){
    const {isExecuting, singleExecution} = useSingleExecution();
    const arrayChildren = Children.toArray(props.children);

    return <>
    {Children.map(arrayChildren, (child, index) => {
        return cloneElement(child,{
            ...child.props,
            onPress: props.shouldUseSingleExecution ? singleExecution(child.props.onPress) : child.props.onPress,
            disabled: child.props.disabled || isExecuting
        })
    })}
    </>
}

MenuItemGroup.displayName = 'MenuItemGroup';
MenuItemGroup.propTypes = propTypes;
MenuItemGroup.defaultProps = defaultProps;

export default MenuItemGroup;