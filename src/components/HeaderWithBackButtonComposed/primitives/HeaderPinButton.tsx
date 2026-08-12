import PinButton from '@components/PinButton';

import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type HeaderPinButtonProps = {
    /** Report used by the pin button. */
    report?: OnyxEntry<Report>;
};

function HeaderPinButton({report}: HeaderPinButtonProps) {
    if (!report) {
        return null;
    }

    return <PinButton report={report} />;
}

export default HeaderPinButton;
export type {HeaderPinButtonProps};
