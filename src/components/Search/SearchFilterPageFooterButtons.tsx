import Button from '@components/Button';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type SearchFilterPageFooterButtonsProps = {
    /** Function to reset changes made in the filter */
    resetChanges?: () => void;

    /** Function to apply changes made in the filter */
    applyChanges: () => void;
};

function SearchFilterPageFooterButtons({resetChanges, applyChanges}: SearchFilterPageFooterButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View>
            {!!resetChanges && (
                <Button
                    size={CONST.BUTTON_SIZE.LARGE}
                    style={[styles.mt3]}
                    onPress={resetChanges}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_RESET_BUTTON}
                >
                    <Button.Text>{translate('common.reset')}</Button.Text>
                </Button>
            )}
            <Button
                size={CONST.BUTTON_SIZE.LARGE}
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                style={[styles.mt3]}
                onPress={applyChanges}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_SAVE_BUTTON}
            >
                <Button.KeyboardShortcut />
                <Button.Text>{translate('common.save')}</Button.Text>
            </Button>
        </View>
    );
}

export default SearchFilterPageFooterButtons;
