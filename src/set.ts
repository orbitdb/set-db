import {
  Database,
  type Identity,
  type Storage,
  type AccessController,
  type MetaData,
  type DagCborEncodable,
  Log,
  LogEntry,
} from "@orbitdb/core";
import type { Libp2p } from "libp2p";
import type { HeliaLibp2p } from "helia";
import type { ServiceMap } from "@libp2p/interface"

export type SetDatabaseType = Awaited<ReturnType<ReturnType<typeof Set>>>;

const type = "set" as const;

const Set =
  () =>
  async <T extends ServiceMap = ServiceMap>({
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
    ipfs: HeliaLibp2p<Libp2p<T>>;
    identity?: Identity;
    address: string;
    name?: string;
    access?: AccessController;
    directory?: string;
    meta?: MetaData;
    headsStorage?: Storage;
    entryStorage?: Storage;
    indexStorage?: Storage;
    referencesCount?: number;
    syncAutomatically?: boolean;
    onUpdate?: (log: Log, entry: LogEntry) => void;
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

    const add = async (value: DagCborEncodable): Promise<string> => {
      return addOperation({ op: "ADD", key: null, value });
    };

    const del = async (value: DagCborEncodable): Promise<string> => {
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
      const vals: { [val: string]: true } = {};
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
