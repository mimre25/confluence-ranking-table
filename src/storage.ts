import ForgeUI, { useState } from "@forge/ui";
import { storage } from "@forge/api";

interface Topic {
  topicName: string;
  votes: number;
  voters: string[];
  creator: string;
}

function createTopic(
  topicName: string,
  creator: string,
  voters: string[],
  votes: number = -1
): Topic {
  const topic = {
    topicName: topicName,
    creator: creator,
    voters: voters,
    votes: 0,
  };
  topic.votes = votes === -1 ? topic.voters.length : votes;

  return topic;
}

async function _storeTopics(storageKey: string, updateFun) {
  const previousTopics = await fetchTopics(storageKey);
  const outTopics = updateFun(previousTopics);
  // console.log("previoustopics:", previousTopics);
  // console.log("outTopics:", outTopics);
  await storage.set(storageKey, outTopics);
  return outTopics;
}

async function fetchTopics(storageKey: string): Promise<Topic[]> {
  console.log("fetching topics...");
  const topics = await storage.get(storageKey);

  // console.log(topics);
  if (!topics) {
    return [];
  }
  return topics;
}

export function useStorage(
  spaceKey: string,
  contentId: string,
  localId: string
) {
  const _storageKey: string =
    "com.ranking-table." + localId + "." + spaceKey + "." + contentId;
  const storageKey: string = _storageKey.replace(/[^a-zA-Z0-9:._\s-#]/g, "_");
  // console.log("rending..");

  const [topics, setTopics] = useState(() => fetchTopics(storageKey));
  return {
    topics,
    async storeTopics(updateFun) {
      console.log("storing topics...");
      const updatedTopics = await _storeTopics(storageKey, updateFun);
      setTopics(updatedTopics);
    },
  };
}
