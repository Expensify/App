import type {LinkProps, PressProps} from '@components/TextLink';

import type CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import type React from 'react';
import type {ForwardedRef} from 'react';
import type {ValueOf} from 'type-fest';

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

    navigateFocus?: () => void;
    ref?: ForwardedRef<SignInPageLayoutRef>;
};

type SignInPageLayoutRef = {
    scrollPageToTop: (animated?: boolean) => void;
};

type FooterLink = (LinkProps | PressProps) & {
    sentryLabel: ValueOf<typeof CONST.SENTRY_LABEL.SIGN_IN.FOOTER_LINK>;
};

type FooterColumnRow = FooterLink & {
    translationPath: TranslationPaths;
};

export type {SignInPageLayoutRef, SignInPageLayoutProps, FooterLink, FooterColumnRow};
