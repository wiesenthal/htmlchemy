import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { agents } from "./schema";

export type Agent<T extends "" | undefined = undefined> = T extends ""
  ? InferInsertModel<typeof agents>
  : InferSelectModel<typeof agents>;
