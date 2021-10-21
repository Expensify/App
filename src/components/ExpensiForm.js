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
        const childrenWrapperWithProps = React.Children.map(this.props.children, child => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                    onChange: this.onChange,
                })
            }
        });

        return (
            <>
               {childrenWrapperWithProps} 
            </>
        );
    }
}

// ExpensiForm.propTypes = propTypes;
// ExpensiForm.defaultProps = defaultProps;
export default ExpensiForm;
