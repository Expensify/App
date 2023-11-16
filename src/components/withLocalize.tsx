import PropTypes from 'prop-types';
import React, {ComponentType, ForwardedRef, forwardRef, ReactElement, RefAttributes} from 'react';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import {LocaleContext, LocaleContextProps} from './LocaleContextProvider';

const withLocalizePropTypes = {
    /** Returns translated string for given locale and phrase */
    translate: PropTypes.func.isRequired,

    /** Formats number formatted according to locale and options */
    numberFormat: PropTypes.func.isRequired,

    /** Converts a datetime into a localized string representation that's relative to current moment in time */
    datetimeToRelative: PropTypes.func.isRequired,

    /** Formats a datetime to local date and time string */
    datetimeToCalendarTime: PropTypes.func.isRequired,

    /** Updates date-fns internal locale */
    updateLocale: PropTypes.func.isRequired,

    /** Returns a locally converted phone number for numbers from the same region
     * and an internationally converted phone number with the country code for numbers from other regions */
    formatPhoneNumber: PropTypes.func.isRequired,

    /** Gets the standard digit corresponding to a locale digit */
    fromLocaleDigit: PropTypes.func.isRequired,

    /** Gets the locale digit corresponding to a standard digit */
    toLocaleDigit: PropTypes.func.isRequired,
};

type WithLocalizeProps = LocaleContextProps;

export default function withLocalize<TProps extends WithLocalizeProps, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): (props: Omit<TProps, keyof LocaleContextProps> & React.RefAttributes<TRef>) => ReactElement | null {
    function WithLocalize(props: Omit<TProps, keyof WithLocalizeProps>, ref: ForwardedRef<TRef>) {
        return (
            <LocaleContext.Consumer>
                {(translateUtils) => (
                    <WrappedComponent
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...translateUtils}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...(props as TProps)}
                        ref={ref}
                    />
                )}
            </LocaleContext.Consumer>
        );
    }

    WithLocalize.displayName = `withLocalize(${getComponentDisplayName(WrappedComponent)})`;
    return forwardRef(WithLocalize);
}

export {withLocalizePropTypes};
export type {WithLocalizeProps};
