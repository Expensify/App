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
