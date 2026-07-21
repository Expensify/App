import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {TranslationPaths} from '@src/languages/types';

import React from 'react';

import Button from './Button';
import DotIndicatorMessage from './DotIndicatorMessage';
import FixedFooter from './FixedFooter';

type AvatarPageFooterProps = {
    /** Translation key of the validation error to show, if any */
    validationError?: TranslationPaths | null | '';

    /** Standalone params for the validation error translation */
    phraseArgs?: unknown[];

    /** Whether the save button is enabled */
    isDirty: boolean;

    /** Called when the save button is pressed */
    onSave: () => void;
};

function AvatarPageFooter({validationError, phraseArgs = [], isDirty, onSave}: AvatarPageFooterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <FixedFooter style={styles.mtAuto}>
            {!!validationError && (
                <DotIndicatorMessage
                    style={styles.mv5}
                    // `phraseArgs` is an open list but `translate` accepts only the params shape for the
                    // given key; the cast is safe because callers always pass params matching `validationError`.
                    messages={{validationError: (translate as (key: TranslationPaths, ...args: unknown[]) => string)(validationError, ...phraseArgs)}}
                    type="error"
                />
            )}
            <Button
                large
                success
                text={translate('common.save')}
                isDisabled={!isDirty}
                onPress={onSave}
                pressOnEnter
            />
        </FixedFooter>
    );
}

export default AvatarPageFooter;
