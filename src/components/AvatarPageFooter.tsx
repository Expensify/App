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

    /** Params for the validation error translation */
    phraseParam?: Record<string, unknown>;

    /** Whether the save button is enabled */
    isDirty: boolean;

    /** Called when the save button is pressed */
    onSave: () => void;
};

function AvatarPageFooter({validationError, phraseParam = {}, isDirty, onSave}: AvatarPageFooterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <FixedFooter style={styles.mtAuto}>
            {!!validationError && (
                <DotIndicatorMessage
                    style={styles.mv5}
                    // `phraseParam` is an open record but `translate` accepts only the params shape for the
                    // given key; the cast is safe because callers always pass params matching `validationError`.
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                    messages={{validationError: translate(validationError, phraseParam as never)}}
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
