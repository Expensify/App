/**
 * Registry of attributes that the attachGlobalSpanAttributes middleware stamps onto every outgoing span.
 */
type GlobalSpanAttributeValue = string | number | boolean;

const globalSpanAttributes: Record<string, GlobalSpanAttributeValue> = {};

function setGlobalSpanAttribute(name: string, value: GlobalSpanAttributeValue) {
    globalSpanAttributes[name] = value;
}

function getGlobalSpanAttributes(): Record<string, GlobalSpanAttributeValue> {
    return globalSpanAttributes;
}

/** Removes every registered attribute, so spans of the next session/account don't carry the previous account's values. */
function clearGlobalSpanAttributes() {
    for (const key of Object.keys(globalSpanAttributes)) {
        delete globalSpanAttributes[key];
    }
}

export {clearGlobalSpanAttributes, getGlobalSpanAttributes, setGlobalSpanAttribute};
