import SubBackButton from './BackButton';
import SubContent from './Content';
import SubBase from './Root';
import SubTrigger from './Trigger';

const Sub = Object.assign(SubBase, {Trigger: SubTrigger, Content: SubContent, BackButton: SubBackButton});

export {Sub};
export type {SubProps as PopoverMenuSubProps} from './Root';
export type {SubTriggerProps as PopoverMenuSubTriggerProps} from './Trigger';
export type {SubContentProps as PopoverMenuSubContentProps} from './Content';
export type {SubBackButtonProps as PopoverMenuSubBackButtonProps} from './BackButton';
export {useIsAtActiveLevel} from './context';
export {default as useSubTrigger} from './useTrigger';
export type {UseSubTriggerResult as UsePopoverMenuSubTriggerResult} from './useTrigger';
export {default as useSubBackButton} from './useBackButton';
export type {UseSubBackButtonResult as UsePopoverMenuSubBackButtonResult} from './useBackButton';
