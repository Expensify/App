/**
 * Puts a green Use suggestion button beside the submit button of a rule form when Concierge refused the rule with a
 * suggestion. The submit button turns neutral, so that the suggestion is the suggested action.
 */
import Button from '@components/Button';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';

type SuggestionButtonRow = {
    /** Whether the form's submit button has the neutral color */
    isSubmitButtonNeutral: boolean;

    /** The style of the view around the submit button and the Use suggestion button */
    containerStyles?: StyleProp<ViewStyle>;

    /** The style of the submit button */
    submitButtonStyles?: StyleProp<ViewStyle>;

    /** The Use suggestion button, for the form's footer */
    footerContent: ReactNode;
};

function useSuggestionButtonRow(suggestedPrompt: string | undefined, onUseSuggestion: (suggestedPrompt: string) => void): SuggestionButtonRow {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    if (!suggestedPrompt) {
        return {isSubmitButtonNeutral: false, footerContent: null};
    }

    return {
        isSubmitButtonNeutral: true,

        // The buttons share a row and wrap to two rows when a translated label does not fit beside the other one
        containerStyles: [styles.flexRow, styles.flexWrap, styles.gap2],

        // The form puts a bottom margin on the submit button when the footer follows it. Side by side, the buttons must line up.
        submitButtonStyles: [styles.flexGrow1, styles.flexBasisAuto, styles.mb0],
        footerContent: (
            <Button
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                size={CONST.BUTTON_SIZE.LARGE}
                onPress={() => onUseSuggestion(suggestedPrompt)}
                // This button sends GenerateRule, which needs a connection
                isDisabled={isOffline}
                style={[styles.flexGrow1, styles.flexBasisAuto]}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.DESCRIBE_RULE_TRY_SUGGESTION}
            >
                <Button.Text>{translate('workspace.rules.newRule.impossible.useSuggestion')}</Button.Text>
            </Button>
        ),
    };
}

export default useSuggestionButtonRow;
