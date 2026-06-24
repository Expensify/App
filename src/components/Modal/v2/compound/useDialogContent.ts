import {useId} from 'react';
import CONST from '@src/CONST';

type DialogRole = typeof CONST.ROLE.DIALOG | typeof CONST.ROLE.ALERTDIALOG;

type UseDialogContentInput = {
    role?: DialogRole;
    modal?: boolean;
    contentID?: string;
    triggerID?: string;
    titleID?: string;
    descriptionID?: string;
    accessibilityLabel?: string;
};

type UseDialogContentResult = {
    dialogProps: {
        role: DialogRole;
        nativeID: string;
        accessibilityLabel?: string;
        accessibilityLabelledBy: string;
        accessibilityDescribedBy: string;
        // eslint-disable-next-line @typescript-eslint/naming-convention -- WAI-ARIA attribute name.
        'aria-modal'?: boolean;
    };
    titleProps: {nativeID: string};
    descriptionProps: {nativeID: string};
};

function useDialogContent({
    role = CONST.ROLE.DIALOG,
    modal = true,
    contentID: contentIDProp,
    titleID: titleIDProp,
    descriptionID: descriptionIDProp,
    accessibilityLabel,
}: UseDialogContentInput = {}): UseDialogContentResult {
    const generatedContentID = useId();
    const generatedTitleID = useId();
    const generatedDescriptionID = useId();
    const contentID = contentIDProp ?? generatedContentID;
    const titleID = titleIDProp ?? generatedTitleID;
    const descriptionID = descriptionIDProp ?? generatedDescriptionID;

    return {
        dialogProps: {
            role,
            nativeID: contentID,
            accessibilityLabel,
            accessibilityLabelledBy: titleID,
            accessibilityDescribedBy: descriptionID,
            // eslint-disable-next-line @typescript-eslint/naming-convention -- WAI-ARIA attribute name.
            'aria-modal': modal || undefined,
        },
        titleProps: {nativeID: titleID},
        descriptionProps: {nativeID: descriptionID},
    };
}

export default useDialogContent;
export type {DialogRole, UseDialogContentInput, UseDialogContentResult};
