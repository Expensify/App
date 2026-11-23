import ModalContext from '@components/Modal/ModalContext';
import RenderHTML from '@components/RenderHTML';
import ScrollView from '@components/ScrollView';

import useLocalize from '@hooks/useLocalize';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import type {ReactNode} from 'react';

import React, {useContext} from 'react';
import {View} from 'react-native';

/** Height of the modal title, the Pay and Cancel buttons and the paddings around the prompt */
const MODAL_CHROME_HEIGHT = 210;

const NON_BREAKING_SPACE = '\u00A0';

type WisePaymentPromptProps = {
    /** The quote the admin confirms */
    children: ReactNode;

    /** How the disclosure names the button that confirms the payment, without the amount the button shows */
    buttonText: string;
};

/** The quote with Wise's terms under it, scrolling only when the window is too short to fit them above the buttons */
function WisePaymentPrompt({children, buttonText}: WisePaymentPromptProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowHeight} = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const {isContentWrappedInScrollView} = useContext(ModalContext);

    // Non-breaking spaces keep the quoted button text, like "Pay all", and each link label on one line in the disclosure
    const disclosure = translate('iou.wisePaymentSummary.paymentDisclosure', {buttonText: buttonText.replaceAll(' ', NON_BREAKING_SPACE)}).replaceAll(
        /(<a [^>]*>)([^<]*)(<\/a>)/g,
        (link, openingTag: string, label: string, closingTag: string) => `${openingTag}${label.replaceAll(' ', NON_BREAKING_SPACE)}${closingTag}`,
    );

    const content = (
        <>
            {children}
            {/* With the buttons' own top margin, the bottom margin leaves the same 20px gap under the disclosure as above it */}
            <View style={[styles.mt5, styles.mb1]}>
                <RenderHTML html={disclosure} />
            </View>
        </>
    );

    // Nested vertical ScrollViews can't share a drag, so the prompt doesn't scroll when the modal already does
    if (isContentWrappedInScrollView) {
        return <View>{content}</View>;
    }

    return <ScrollView style={StyleUtils.getMaximumHeight(windowHeight - MODAL_CHROME_HEIGHT - insets.top - insets.bottom)}>{content}</ScrollView>;
}

export default WisePaymentPrompt;
