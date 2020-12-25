import { assert } from "../utils/assert";

function formatUnexpectedArgument(arg: any) {
    var type = typeof arg;
    if (type !== 'object') {
        return type;
    }
    var displayName = (arg.constructor && arg.constructor.name) || type;
    var keys = Object.keys(arg);
    if (keys.length > 0 && keys.length < 20) {
        return `${displayName} (keys: ${keys.join(', ')})`;
    }
    return displayName;
}

export function validateCallback(callback: any, callerName: string) {
    assert(
        !callback || typeof callback === 'function',
        `${callerName}(...): Expected the last optional \`callback\` argument to be a ` +
        `function. Instead received: ${formatUnexpectedArgument(callback)}.`
    );
}