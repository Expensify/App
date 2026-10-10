import ConfirmationPage from '@components/ConfirmationPage/ConfirmationPage';
import ConfirmationPageContent from '@components/ConfirmationPage/layout/ConfirmationPageContent';
import ConfirmationPageDescription from '@components/ConfirmationPage/primitives/ConfirmationPageDescription';
import ConfirmationPageHeading from '@components/ConfirmationPage/primitives/ConfirmationPageHeading';
import ConfirmationPageIllustration from '@components/ConfirmationPage/primitives/ConfirmationPageIllustration';
import ConfirmationPagePrimaryButton from '@components/ConfirmationPage/primitives/ConfirmationPagePrimaryButton';
import FixedFooter from '@components/FixedFooter';
import LottieAnimations from '@components/LottieAnimations';
import type DotLottieAnimation from '@components/LottieAnimations/types';

import type {Errors} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

type ConfirmationPageProps = {
    /** Illustration shown at the top: a Lottie animation or a static icon. Defaults to the fireworks animation */
    illustration?: DotLottieAnimation | IconAsset;

    /** Heading text displayed below the illustration */
    heading: string;

    /** Description text displayed below the heading */
    description: string;

    /** The text for the button label */
    buttonText?: string;

    /** A function that is called when the button is clicked on */
    onButtonPress?: () => void;

    /** Whether the button should be disabled */
    isButtonDisabled?: boolean;

    /** Whether the button should show a loading spinner */
    isButtonLoading?: boolean;

    /** Errors rendered as a message inside the footer, above the button */
    requestErrors?: Errors | null;

    /** Additional style for the outermost container */
    containerStyle?: StyleProp<ViewStyle>;

    /** Additional style for the centered container wrapping the illustration, heading and description */
    innerContainerStyle?: StyleProp<ViewStyle>;

    /** Additional style for the illustration */
    illustrationStyle?: StyleProp<ViewStyle>;

    /** Additional style for the heading text */
    headingStyle?: StyleProp<TextStyle>;

    /** Additional style for the description text */
    descriptionStyle?: StyleProp<TextStyle>;

    /** Additional style for the footer containing the button */
    footerStyle?: StyleProp<ViewStyle>;
};

function ConfirmationPageDefault({
    illustration = LottieAnimations.Fireworks,
    heading,
    description,
    buttonText = '',
    onButtonPress = () => {},
    isButtonDisabled = false,
    isButtonLoading = false,
    headingStyle,
    illustrationStyle,
    descriptionStyle,
    footerStyle,
    requestErrors,
    containerStyle,
    innerContainerStyle,
}: ConfirmationPageProps) {
    return (
        <ConfirmationPage style={containerStyle}>
            <ConfirmationPageContent
                style={innerContainerStyle}
                requestErrors={requestErrors}
            >
                <ConfirmationPageIllustration
                    illustration={illustration}
                    illustrationStyle={illustrationStyle}
                />
                <ConfirmationPageHeading style={headingStyle}>{heading}</ConfirmationPageHeading>
                <ConfirmationPageDescription style={descriptionStyle}>{description}</ConfirmationPageDescription>
            </ConfirmationPageContent>
            <FixedFooter style={footerStyle}>
                <ConfirmationPagePrimaryButton
                    text={buttonText}
                    isDisabled={isButtonDisabled}
                    isLoading={isButtonLoading}
                    onPress={onButtonPress}
                />
            </FixedFooter>
        </ConfirmationPage>
    );
}

export default ConfirmationPageDefault;
