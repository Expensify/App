type MessageElementBase = {
    readonly kind: string;
    readonly content: string;
};

type MessageTextElement = {
    readonly kind: 'text';
    readonly content: string;
} & MessageElementBase;

export type {MessageElementBase, MessageTextElement};
