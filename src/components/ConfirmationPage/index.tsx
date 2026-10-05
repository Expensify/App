/**
 * ConfirmationPage: a confirmation/illustration screen built with composition API.
 *
 * Instead of a large flat props list (illustration, heading, description, shouldShowButton, …),
 * sub-components are composed as children:
 *
 * @example
 * ```tsx
 * import ConfirmationPage from '@components/ConfirmationPage';
 *
 * <ConfirmationPage>
 *   <ConfirmationPage.Content>
 *     <ConfirmationPage.Illustration illustration={LottieAnimations.Fireworks} />
 *     <ConfirmationPage.Heading>All set!</ConfirmationPage.Heading>
 *     <ConfirmationPage.Description>Your changes have been saved.</ConfirmationPage.Description>
 *   </ConfirmationPage.Content>
 *   <FixedFooter>
 *     <ConfirmationPage.PrimaryButton text="Got it" onPress={handleConfirm} />
 *   </FixedFooter>
 * </ConfirmationPage>
 * ```
 *
 * For the common illustration/heading/description/button shape without custom composition, use `ConfirmationPageDefault` instead.
 */
import React from 'react';

import ConfirmationPageComponent from './ConfirmationPage';
import ConfirmationPageContent from './layout/Content';
import ConfirmationPageDescription from './primitives/ConfirmationPageDescription';
import ConfirmationPageHeading from './primitives/ConfirmationPageHeading';
import ConfirmationPageIllustration from './primitives/ConfirmationPageIllustration';
import ConfirmationPagePrimaryButton from './primitives/ConfirmationPagePrimaryButton';
import ConfirmationPageSecondaryButton from './primitives/ConfirmationPageSecondaryButton';

function ConfirmationPageBase(props: React.ComponentProps<typeof ConfirmationPageComponent>) {
    return <ConfirmationPageComponent {...props} />;
}

const ConfirmationPage = Object.assign(ConfirmationPageBase, {
    Illustration: ConfirmationPageIllustration,
    Heading: ConfirmationPageHeading,
    Description: ConfirmationPageDescription,
    PrimaryButton: ConfirmationPagePrimaryButton,
    SecondaryButton: ConfirmationPageSecondaryButton,
    Content: ConfirmationPageContent,
});

export default ConfirmationPage;
