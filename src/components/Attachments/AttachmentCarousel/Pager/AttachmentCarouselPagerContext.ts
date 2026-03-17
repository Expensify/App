import {createContext, useContext} from 'react';
import type {AttachmentCarouselPagerActionsContextType, AttachmentCarouselPagerStateContextType} from './types';

const AttachmentCarouselPagerStateContext = createContext<AttachmentCarouselPagerStateContextType | null>(null);
const AttachmentCarouselPagerActionsContext = createContext<AttachmentCarouselPagerActionsContextType | null>(null);

function useAttachmentCarouselPagerState(): AttachmentCarouselPagerStateContextType | null {
    return useContext(AttachmentCarouselPagerStateContext);
}

function useAttachmentCarouselPagerActions(): AttachmentCarouselPagerActionsContextType | null {
    return useContext(AttachmentCarouselPagerActionsContext);
}

export {AttachmentCarouselPagerActionsContext, AttachmentCarouselPagerStateContext, useAttachmentCarouselPagerActions, useAttachmentCarouselPagerState};
export type {AttachmentCarouselPagerActionsContextType, AttachmentCarouselPagerItems, AttachmentCarouselPagerStateContextType} from './types';
