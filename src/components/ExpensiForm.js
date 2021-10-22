import React from 'react';

// const propTypes = {

// };

// const defaultProps = {

// };

class ExpensiForm extends React.Component {
    constructor(props) {
        super(props);

        this.name = this.props.formName;

        this.onChange = this.onChange.bind(this);
    }

    onChange() {
        console.log(`${this.props.formName}_change`);
    }

    render() {
        const childrenWrapperWithProps = (children) => {
            return React.Children.map(children, child => {
                if (!React.isValidElement(child)) {
                    return child;
                }

                if (child.props.children) {
                    child = React.cloneElement(child, {
                        children: childrenWrapperWithProps(child.props.children)
                    })
                }
                console.log(child.displayName)
                return React.cloneElement(child, {
                    onChange: this.onChange,
                })
            })
        };

        return (
            <>
               {childrenWrapperWithProps(this.props.children)} 
            </>
        );
    }
}

// ExpensiForm.propTypes = propTypes;
// ExpensiForm.defaultProps = defaultProps;
export default ExpensiForm;
