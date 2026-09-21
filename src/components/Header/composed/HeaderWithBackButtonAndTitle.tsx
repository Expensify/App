import Header from '@components/Header/Header';
import HeaderRight from '@components/Header/layout/HeaderRight';
import HeaderBackButton from '@components/Header/primitives/HeaderBackButton';
import HeaderTitle from '@components/Header/primitives/HeaderTitle';

import type {StepCounterParams} from '@src/languages/params';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

type HeaderWithBackButtonAndTitleProps = Partial<ChildrenProps> & {
    title?: string;
    subtitle?: string;
    titleColor?: string;

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress?: () => void;

    /** Data to display a step counter in the header */
    stepCounter?: StepCounterParams;

    shouldUseHeadlineHeader?: boolean;

    /** The fill color for the icon. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue'. */
    iconFill?: string;

    titleStyles?: StyleProp<TextStyle>;
    style?: StyleProp<ViewStyle>;

    /** The URL link associated with the attachment's subtitle, if available */
    subTitleLink?: string;

    /** Whether to skip focus of the first interactive element inside the header after the RHP transition for screen reader announcement.  */
    shouldSkipFocusAfterTransition?: boolean;
};

function HeaderWithBackButtonAndTitle({
    children,
    iconFill,
    onBackButtonPress,
    shouldUseHeadlineHeader = false,
    stepCounter,
    subtitle = '',
    title = '',
    titleColor,
    titleStyles,
    style,
    subTitleLink = '',
    shouldSkipFocusAfterTransition = false,
}: HeaderWithBackButtonAndTitleProps) {
    return (
        <Header style={style}>
            <HeaderBackButton
                onPress={onBackButtonPress}
                iconFill={iconFill}
                shouldSkipFocusAfterTransition={shouldSkipFocusAfterTransition}
            />
            <HeaderTitle
                title={title}
                subtitle={subtitle}
                stepCounter={stepCounter}
                titleColor={titleColor}
                titleStyles={titleStyles}
                subTitleLink={subTitleLink}
                shouldSkipFocusAfterTransition={shouldSkipFocusAfterTransition}
                shouldUseHeadlineHeader={shouldUseHeadlineHeader}
            />
            <HeaderRight>{children}</HeaderRight>
        </Header>
    );
}

export default HeaderWithBackButtonAndTitle;
