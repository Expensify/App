const ScimTokenState = {
    VALUE: 'value',
    LOADING: 'loading',
    ERROR: 'error',
} as const;

type ScimTokenWithState =
    | {
          state: typeof ScimTokenState.VALUE;
          value: string;
      }
    | {
          state: typeof ScimTokenState.ERROR;
          error: string;
      }
    | {
          state: typeof ScimTokenState.LOADING;
      }
    | undefined;

export type {ScimTokenWithState};
export {ScimTokenState};
