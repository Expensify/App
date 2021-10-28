import React, {createContext, forwardRef} from 'react';
const FormContext = createContext(null);

class FormContextProvider extends React.Component {
    onChange() {
        console.log('fired');
    }

    /**
    * The context this component exposes to child components
    * @returns {object} translation util functions and locale
    */
    getContextValue() {
        return {
            onChange: this.onChange.bind(this),
        };
    }

    render() {
        return (
            <FormContext.Provider value={this.getContextValue()}>
                {this.props.children}
            </FormContext.Provider>
        );
    }
}

export default function withForm(WrappedComponent) {
    const WithForm = forwardRef((props, ref) => (
        <FormContext.Consumer>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            {(utils) => <WrappedComponent {...utils} {...props} ref={ref} />}
        </FormContext.Consumer>
    ));

    return WithForm;
}

export {
    FormContextProvider,
};
