import React, {use} from 'react';
import useLocalize from '@hooks/useLocalize';
import type {LoadedInspector} from '@libs/XStateInspector/types';
import Button from './Button';
import TestToolRow from './TestToolRow';

type XStateInspectorTestToolRowProps = {
    ready: Promise<LoadedInspector | null>;
};

function XStateInspectorTestToolRow({ready}: XStateInspectorTestToolRowProps) {
    const {translate} = useLocalize();
    const inspector = use(ready);

    if (!inspector) {
        return null;
    }

    return (
        <TestToolRow title={translate('initialSettingsPage.troubleshoot.xstateInspector')}>
            <Button
                small
                text={translate('initialSettingsPage.troubleshoot.openXstateInspector')}
                onPress={inspector.start}
            />
        </TestToolRow>
    );
}

export default XStateInspectorTestToolRow;
