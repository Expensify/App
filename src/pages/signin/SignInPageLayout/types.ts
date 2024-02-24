import type React from 'react';
import {Account} from '@src/types/onyx';

type SignInPageLayoutProps = {
    /** The children to show inside the layout */
    children?: React.ReactNode;

    /** Welcome text to show in the header of the form, changes depending
     * on a form type (for example, sign in) */
    welcomeText?: string;

    /** Welcome header to show in the header of the form, changes depending
     * on a form type (for example, sign in) and small vs large screens */
    welcomeHeader: string;

    /** Whether to show welcome text on a particular page */
    shouldShowWelcomeText?: boolean;

    /** Whether to show welcome header on a particular page */
    shouldShowWelcomeHeader?: boolean;

    /** Override the green headline copy */
    customHeadline?: string;

    /** Override the smaller hero body copy below the headline */
    customHeroBody?: string;

    /** The details about the account that the user is signing in with */
    account: Account;

    navigateFocus?: () => void;
};

type SignInPageLayoutRef = {
    scrollPageToTop: (animated?: boolean) => void;
};

export type {SignInPageLayoutRef, SignInPageLayoutProps};
