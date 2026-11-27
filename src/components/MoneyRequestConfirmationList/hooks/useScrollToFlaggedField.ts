/**
 * Scrolls the money request confirmation to the field a blocked confirm flagged first, so its error is seen even when
 * the user had scrolled past that field. Each field attaches its outer view to the ref it is given here.
 */
import type {ConfirmationField} from '@components/MoneyRequestConfirmationList/getConfirmationFieldErrors';
import type {SelectionListWithSectionsHandle} from '@components/SelectionList/SelectionListWithSections/types';

import type {ComponentRef, RefObject} from 'react';
import type {View} from 'react-native';

import {useEffect, useRef, useState} from 'react';

type ConfirmationFieldViewRefs = Record<ConfirmationField, RefObject<ComponentRef<typeof View> | null>>;

type ViewToReveal = {
    viewRef: RefObject<ComponentRef<typeof View> | null>;
    transactionID: string | undefined;
};

function useScrollToFlaggedField(listRef: RefObject<SelectionListWithSectionsHandle | null>, transactionIDOnScreen: string | undefined) {
    const amountViewRef = useRef<ComponentRef<typeof View>>(null);
    const merchantViewRef = useRef<ComponentRef<typeof View>>(null);
    const dateViewRef = useRef<ComponentRef<typeof View>>(null);
    const taxAmountViewRef = useRef<ComponentRef<typeof View>>(null);
    const attendeesViewRef = useRef<ComponentRef<typeof View>>(null);
    const fieldViewRefs: ConfirmationFieldViewRefs = {amount: amountViewRef, merchant: merchantViewRef, date: dateViewRef, taxAmount: taxAmountViewRef, attendees: attendeesViewRef};

    // A new object for every blocked confirm, so confirming again scrolls again even when the same field is flagged.
    const [viewToReveal, setViewToReveal] = useState<ViewToReveal | null>(null);
    const revealedViewRef = useRef<ViewToReveal | null>(null);

    // The scroll waits until the flagged receipt is on screen with its error rendered, since revealing can open "Show more" or switch receipts first.
    useEffect(() => {
        if (!viewToReveal || viewToReveal === revealedViewRef.current || viewToReveal.transactionID !== transactionIDOnScreen) {
            return;
        }
        revealedViewRef.current = viewToReveal;
        listRef.current?.scrollToReveal(viewToReveal.viewRef.current);
    }, [viewToReveal, transactionIDOnScreen, listRef]);

    const scrollToField = (field: ConfirmationField, transactionID: string | undefined) => setViewToReveal({viewRef: fieldViewRefs[field], transactionID});

    return {fieldViewRefs, scrollToField};
}

export default useScrollToFlaggedField;
export type {ConfirmationFieldViewRefs};
