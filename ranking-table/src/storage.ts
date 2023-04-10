import ForgeUI from "@forge/ui";
import { storage } from "@forge/api";


interface Topic {
  topicName: string;
  votes: number;
  voters: string[];
  creator: string;
};





export function useStorage(spaceKey: string, contentId: string, localId: string) {
  const _storageKey: string = "com.ranking-table."+ localId + "." + spaceKey + "." + contentId;
  const storageKey: string = _storageKey.replace(/[^a-zA-Z0-9:._\s-#]/g, "_");
  console.log("using storage", _storageKey, storageKey);

  return {
    async storeTopics(topics: Topic[]) {
      console.log("storing topics...");
      return await storage.set(storageKey, topics);
    },
    async fetchTopics(): Promise<Topic[]> {
      console.log("fetching topics...");
      const topics = await storage.get(storageKey);
      if (!topics) {
        return [];
      }
      return topics;
    }
  };

};
