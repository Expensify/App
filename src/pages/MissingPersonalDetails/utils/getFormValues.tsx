import type {OnyxEntry} from 'react-native-onyx';
import type {PersonalDetailsForm} from '@src/types/form';

type FormValues<TProps extends keyof PersonalDetailsForm> = {
    [TKey in TProps]: PersonalDetailsForm[TKey];
};

function getFormValues<TProps extends keyof PersonalDetailsForm>(
    inputKeys: Record<string, TProps>,
    personalDetailsFormDraft: OnyxEntry<PersonalDetailsForm>,
    personalDetailsForm: OnyxEntry<PersonalDetailsForm>,
): FormValues<TProps> {
    return Object.entries(inputKeys).reduce((acc, [, value]) => {
        // @ts-expect-error complaints about Country not being a string, but it is
        acc[value] = (personalDetailsFormDraft?.[value] ?? personalDetailsForm?.[value] ?? '') as PersonalDetailsForm[keyof PersonalDetailsForm];
        return acc;
    }, {} as FormValues<TProps>);
}

export default getFormValues;
