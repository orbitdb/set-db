import { useDatabaseType } from "@orbitdb/core";

import Set from "@/set.js";

export const registerSet = () => useDatabaseType(Set);
