type DefaultPreventable = {defaultPrevented: boolean};

type ConsumerHandler<E> = (event: E) => unknown;

type OurHandler<E> = (event: E) => void;

type ComposeOptions = {
    /** When true (default), our handler runs only if the consumer didn't call `event.preventDefault()`. */
    checkForDefaultPrevented?: boolean;
};

/** Runs the consumer's handler first, then ours; gates ours on `event.defaultPrevented`. */
function composeEventHandlers<E extends DefaultPreventable | undefined>(
    consumerHandler: ConsumerHandler<E> | undefined,
    ourHandler: OurHandler<E>,
    {checkForDefaultPrevented = true}: ComposeOptions = {},
): OurHandler<E> {
    return (event) => {
        consumerHandler?.(event);
        if (!checkForDefaultPrevented || !event?.defaultPrevented) {
            ourHandler(event);
        }
    };
}

export default composeEventHandlers;
export type {DefaultPreventable, ConsumerHandler, OurHandler, ComposeOptions};
