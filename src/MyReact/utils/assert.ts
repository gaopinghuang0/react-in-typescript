// Lightweight replacement for invariant/node assert

export function assert(condition: any) {
    if (!condition) {
        throw new Error('assertion failure');
    }
}
