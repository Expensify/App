import createHeadingSystem from '@components/Overlay/createHeadingSystem';

const {StateContext: ModalContentStateContext, Title, Description, useRegisteredTitle, useRegisteredDescription} = createHeadingSystem('Modal');

export {ModalContentStateContext, Title, Description, useRegisteredTitle, useRegisteredDescription};
export type {TitleProps as ModalTitleProps, DescriptionProps as ModalDescriptionProps, HeadingState as ModalContentState} from '@components/Overlay/createHeadingSystem';
