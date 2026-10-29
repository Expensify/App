import SubBase from './Sub';
import SubBackButton from './SubBackButton';
import SubContent from './SubContent';
import SubTrigger from './SubTrigger';

const Sub = Object.assign(SubBase, {Trigger: SubTrigger, Content: SubContent, BackButton: SubBackButton});

export {Sub};
export type {SubProps} from './Sub';
export type {SubTriggerProps} from './SubTrigger';
export type {SubContentProps} from './SubContent';
export type {SubBackButtonProps} from './SubBackButton';
export {useIsAtActiveLevel} from './SubContext';
export {default as useSubTrigger} from './useSubTrigger';
export type {UseSubTriggerResult} from './useSubTrigger';
export {default as useSubBackButton} from './useSubBackButton';
export type {UseSubBackButtonResult} from './useSubBackButton';
