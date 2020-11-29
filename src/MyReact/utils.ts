// To be used with Array.filter
export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
}

// Lightweight replacement for invariant/node assert
export function assert(condition: any) {
    if (!condition) {
        throw new Error('assertion failure');
    }
};