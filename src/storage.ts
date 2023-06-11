import { storage } from "@forge/api";
import ForgeUI, { useState } from "@forge/ui";

import { createTopic, Topic } from "./topicHandling";

export type UpdateFunction = (topics: Topic[]) => Topic[];
export type StoreTopicsFunction = (updateFun: UpdateFunction) => Promise<void>;

const _storeTopics = async (
  storageKey: string,
  updateFun: UpdateFunction,
): Promise<Topic[]> => {
  const previousTopics = await fetchTopics(storageKey);
  const outTopics = updateFun(previousTopics);
  // Console.log("previoustopics:", previousTopics);
  // Console.log("outTopics:", outTopics);
  await storage.set(storageKey, outTopics);

  return outTopics;
};

const fetchTopics = async (storageKey: string): Promise<Topic[]> => {
  // Console.log("fetching topics...");
  const topics = await storage.get(storageKey);

  // Console.log(topics);
  if (!topics) {
    return [];
  }

  return topics as Topic[];
};

type _storeUpdateFun = (t: Topic[]) => void;
export interface UseStorageInterface {
  storeTopics: StoreTopicsFunction;
  topics: Topic[];
}
export const useStorage = (
  spaceKey: string,
  contentId: string,
  localId: string,
): UseStorageInterface => {
  const _storageKey = `com.ranking-table.${localId}.${spaceKey}.${contentId}`;
  const storageKey = _storageKey.replace(/[^a-zA-Z0-9:._\s-#]/g, "_");
  // Console.log("rending..");

  const [topics, setTopics]: [Topic[], _storeUpdateFun] = useState(
    (): Promise<Topic[]> => fetchTopics(storageKey),
  );

  return {
    topics,
    async storeTopics(updateFun: UpdateFunction) {
      // Console.log("storing topics...");
      const updatedTopics = await _storeTopics(storageKey, updateFun);
      setTopics(updatedTopics);
    },
  };
};
