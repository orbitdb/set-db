import {
  Database,
  type Identity,
  type Storage,
  type AccessController,
} from "@orbitdb/core";
import type { Helia } from "helia";

export type SetDatabaseType = Awaited<ReturnType<ReturnType<typeof Set>>>;

const type = "set" as const;

const Set =
  () =>
  async ({
    ipfs,
    identity,
    address,
    name,
    access,
    directory,
    meta,
    headsStorage,
    entryStorage,
    indexStorage,
    referencesCount,
    syncAutomatically,
    onUpdate,
  }: {
    ipfs: Helia;
    identity?: Identity;
    address: string;
    name?: string;
    access?: AccessController;
    directory?: string;
    meta?: object;
    headsStorage?: Storage;
    entryStorage?: Storage;
    indexStorage?: Storage;
    referencesCount?: number;
    syncAutomatically?: boolean;
    onUpdate?: () => void;
  }) => {
    const database = await Database({
      ipfs,
      identity,
      address,
      name,
      access,
      directory,
      meta,
      headsStorage,
      entryStorage,
      indexStorage,
      referencesCount,
      syncAutomatically,
      onUpdate,
    });

    const { addOperation, log } = database;

    const add = async (value: unknown): Promise<string> => {
      return addOperation({ op: "ADD", key: null, value });
    };

    const del = async (value: unknown): Promise<string> => {
      return addOperation({ op: "DEL", key: null, value });
    };

    const iterator = async function* ({
      amount,
    }: { amount?: number } = {}): AsyncGenerator<
      {
        value: unknown;
        hash: string;
      },
      void,
      unknown
    > {
      const vals: { [val: string]: unknown } = {};
      let count = 0;
      for await (const entry of log.traverse()) {
        const { op, value } = entry.payload;
        const key = JSON.stringify(value);

        if (op === "ADD" && !vals[key]) {
          vals[key] = true;
          count++;
          const hash = entry.hash;
          yield { value, hash };
        } else if (op === "DEL" && !vals[key]) {
          vals[key] = true;
        }
        if (amount !== undefined && count >= amount) {
          break;
        }
      }
    };

    const all = async (): Promise<
      {
        value: unknown;
        hash: string;
      }[]
    > => {
      const values = [];
      for await (const entry of iterator()) {
        values.unshift(entry);
      }
      return values;
    };

    return {
      ...database,
      type,
      add,
      del,
      iterator,
      all,
    };
  };

Set.type = type;

export default Set;
