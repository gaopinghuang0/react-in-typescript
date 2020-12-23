import { render } from "..";

/**
 * Utilities for making it easy to test React components.
 *
 * See https://facebook.github.io/react/docs/test-utils.html
 *
 * Todo: Support the entire DOM.scry query syntax. For now, these simple
 * utilities will suffice for testing purposes.
 * @lends ReactTestUtils
 */
const ReactTestUtils = {
    renderIntoDocument: function (element: any) {
        var div = document.createElement('div');
        // None of our tests actually require attaching the container to the
        // DOM, and doing so creates a mess that we rely on test isolation to
        // clean up, so we're going to stop honoring the name of this method
        // (and probably rename it eventually) if no problems arise.
        // document.documentElement.appendChild(div);
        return render(element, div);
    },

};

export default ReactTestUtils;
