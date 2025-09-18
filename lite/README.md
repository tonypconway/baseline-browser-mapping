# baseline-browser-mapping-lite

A lite version of `baseline-browser-mapping` that provides browser version compatibility data.

## Usage

```javascript
import { getCompatibleVersions } from "baseline-browser-mapping-lite";

const versions = getCompatibleVersions({ widelyAvailableOnDate: "2023-01-01" });
console.log(versions);
```
