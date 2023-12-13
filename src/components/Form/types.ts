import {ElementType, ReactNode, RefObject} from 'react';
import {StyleProp, TextInput, ViewStyle} from 'react-native';
import {OnyxEntry} from 'react-native-onyx';
import {ValueOf} from 'type-fest';
import ONYXKEYS from '@src/ONYXKEYS';
import Form from '@src/types/onyx/Form';
import {Errors} from '@src/types/onyx/OnyxCommon';
import ChildrenProps from '@src/types/utils/ChildrenProps';

type ValueType = 'string' | 'boolean' | 'date';

type InputWrapperProps<TInput extends ElementType> = {
    InputComponent: TInput;
    inputID: string;
    valueType?: ValueType;
};

type FormWrapperOnyxProps = {
    /** Contains the form state that must be accessed outside of the component */
    formState: OnyxEntry<Form>;
};

type FormWrapperProps = ChildrenProps &
    FormWrapperOnyxProps & {
        /** A unique Onyx key identifying the form */
        formID: ValueOf<typeof ONYXKEYS.FORMS>;

        /** Text to be displayed in the submit button */
        submitButtonText: string;

        /** Controls the submit button's visibility */
        isSubmitButtonVisible?: boolean;

        /** Callback to submit the form */
        onSubmit: () => void;

        /** Should the button be enabled when offline */
        enabledWhenOffline?: boolean;

        /** Whether the form submit action is dangerous */
        isSubmitActionDangerous?: boolean;

        /** Whether ScrollWithContext should be used instead of regular ScrollView.
         *  Set to true when there's a nested Picker component in Form.
         */
        scrollContextEnabled?: boolean;

        /** Container styles */
        style?: StyleProp<ViewStyle>;

        /** Submit button styles */
        submitButtonStyles?: StyleProp<ViewStyle>;

        /** Custom content to display in the footer after submit button */
        footerContent?: ReactNode;

        /** Server side errors keyed by microtime */
        errors: Errors;

        // Assuming refs are React refs
        inputRefs: RefObject<Record<string, RefObject<TextInput>>>;
    };

export type {InputWrapperProps, FormWrapperProps, FormWrapperOnyxProps};
