# orbit-db-set
Set database type for orbit-db.

[![orbit-db-set tests](https://github.com/reseau-constellation/set/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/reseau-constellation/set/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/reseau-constellation/set/graph/badge.svg?token=7OZK4BJDej)](https://codecov.io/gh/reseau-constellation/set)

## Installation
```
$ pnpm add @orbitdb/orbit-db-set
```
## Introduction
As `Set` database is like a [`Feed`](https://github.com/reseau-constellation/set), but each value can only be present once. Works for primitive types as well as more complex objects.

## Examples

A simple example with `Set`:
```ts
import { createOrbit } from "@orbitdb/core";
import { registerSet } from "@orbitdb/set";

// Register set database type. IMPORTANT - must call before creating orbit instance !
registerSet();

const orbit = await createOrbit({ ipfs })

const db = await orbit.open({ type: "set" });

await db.add(1);
await db.add(2);

const all = await db.all();  // [1, 2]

await db.add(1);
await db.all()  // Yay !! Still [1, 2]
```

As more complex example with object types:
```ts
import { createOrbit } from "@orbitdb/core";
import { registerSet } from "@orbitdb/set";

// Register set database type. IMPORTANT - must call before creating orbit instance !
registerSet();

const orbit = await createOrbit({ ipfs })

const db = await orbit.open({ type: "set" });

await db.add({a: 1});
await db.add({a: 2});

const all = await db.all();  // [{a: 1}, {a: 2}]

await db.add({a: 1});
await db.all()  // Yay !! Still [{a: 1}, {a: 2}]
```
