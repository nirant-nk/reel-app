import { Connection } from "mongoose";

declare global{
    var mongoose: {
        conn: Connection | null, // for caching the connection in case of multiple calls
        promise: Promise<Connection> | null // for caching the promise in case the conn is not made yet
    }
}

export { }; // to make this file a module and avoid global scope issues
