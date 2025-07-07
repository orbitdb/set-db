import { Database } from "@orbitdb/core";
import type {
  Identity,
  Storage,
  AccessController,
  MetaData,
  DagCborEncodable,
  Log,
  LogEntry,
  InternalDatabase,
} from "@orbitdb/core";
import type { Libp2p } from "libp2p";
import type { HeliaLibp2p } from "helia";
import type { ServiceMap } from "@libp2p/interface";

export type SetDatabaseType = Awaited<ReturnType<ReturnType<typeof SetDb>>>;

const type = "set" as const;

const SetDb =
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

    const { add, del, iterator, all } = SetApi({ database });

    return {
      ...database,
      type,
      add,
      del,
      iterator,
      all,
    };
  };

SetDb.type = type;

export const SetApi = ({ database }: { database: InternalDatabase }) => {
  const add = async (value: DagCborEncodable): Promise<string> => {
    // TODO: check if value already exists? (Optimises memory over speed)
    return database.addOperation({ op: "ADD", key: null, value });
  };

  const del = async (value: DagCborEncodable): Promise<string> => {
    return database.addOperation({ op: "DEL", key: null, value });
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
    for await (const entry of database.log.traverse()) {
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

  const all = async (): Promise<Set<unknown>> => {
    const values = [];
    for await (const entry of iterator()) {
      values.unshift(entry);
    }
    return new Set(values.map((v) => v.value));
  };

  return {
    add,
    del,
    iterator,
    all,
  };
};

export default SetDb;
