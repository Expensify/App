import ConfirmationPage from '@components/ConfirmationPage/ConfirmationPage';
import ConfirmationPageContent from '@components/ConfirmationPage/layout/Content';
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
    illustration?: DotLottieAnimation | IconAsset;
    heading: string;
    description: string;

    /** The text for the primary button label */
    buttonText?: string;

    /** A function that is called when the primary button is clicked on */
    onButtonPress?: () => void;

    /** Whether the primary confirmation button should be disabled */
    isButtonDisabled?: boolean;

    /** Whether the primary confirmation button should show a loading spinner */
    isButtonLoading?: boolean;

    /** Component rendered inside the footer, above the buttons (e.g. an inline error message) */
    requestErrors?: Errors | null;

    containerStyle?: ViewStyle;
    innerContainerStyle?: ViewStyle;
    illustrationStyle?: StyleProp<ViewStyle>;
    headingStyle?: TextStyle;
    descriptionStyle?: StyleProp<TextStyle>;
    footerStyle?: ViewStyle;
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

export type {ConfirmationPageProps};
