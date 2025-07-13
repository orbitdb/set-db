# Version 1 => 2

## `registerSet` removed
Simply use the `useDatabaseType` from `@orbitdb/core` instead.

Previously:
```ts
import { registerSet } from "@orbitdb/set-db";

registerSet();
```

Now:
```ts
import { useDatabaseType } from "@orbitdb/core";
import { SetDb } from "@orbitdb/set-db";

useDatabaseType(SetDb);
```

## `Set` export renamed as `SetDb`
This now avoids overriding the inbuilt `Set` type.

Previously:
```ts
import { Set } from "@orbitdb/set-db";

```

Now:
```ts
import { SetDb } from "@orbitdb/set-db";

```