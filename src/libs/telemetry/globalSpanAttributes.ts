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

export {getGlobalSpanAttributes, setGlobalSpanAttribute};
export type {GlobalSpanAttributeValue};
