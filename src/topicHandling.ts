import ForgeUI from "@forge/ui";

import { StoreTopicsFunction } from "./storage";
export interface Topic {
  creator: string;
  topicName: string;
  voters: string[];
  votes: number;
}

export interface NewTopicData {
  topic: string;
}

export const createTopic = (
  topicName: string,
  creator: string,
  voters: string[],
  votes: number = -1,
): Topic => {
  const topic = {
    creator,
    topicName,
    voters,
    votes: 0,
  };
  topic.votes = votes === -1 ? topic.voters.length : votes;

  return topic;
};

export const deleteTopic = async (
  topic: Topic,
  storeTopics: StoreTopicsFunction,
): Promise<void> => {
  // Console.log("topic:", topic);
  await storeTopics((topics: Topic[]): Topic[] => {
    let idx = -1;
    for (let i = 0; i < topics.length; i += 1) {
      if (topics[i].topicName === topic.topicName) {
        idx = i;
      }
    }
    if (idx >= 0) {
      topics.splice(idx, 1);
    }

    return topics;
  });
};

const addVote = (
  topics: Topic[],
  topicName: string,
  currentUser: string,
): Topic[] => {
  for (const topic of topics) {
    if (topic.topicName === topicName && !topic.voters.includes(currentUser)) {
      topic.votes += 1;
      topic.voters.push(currentUser);
    }
  }

  return topics;
};

const removeVote = (
  topics: Topic[],
  topicName: string,
  currentUser: string,
): Topic[] => {
  for (const topic of topics) {
    if (topic.topicName === topicName) {
      const idx = topic.voters.indexOf(currentUser);
      if (idx >= 0) {
        topic.votes -= 1;
        topic.voters.splice(idx, 1);
      }
    }
  }

  return topics;
};

export const updateVote = async (
  topic: Topic,
  currentUser: string,
  storeTopics: StoreTopicsFunction,
): Promise<void> => {
  // Console.log(topic);
  if (topic.voters.includes(currentUser)) {
    await storeTopics((topics: Topic[]): Topic[] =>
      removeVote(topics, topic.topicName, currentUser),
    );
  } else {
    await storeTopics((topics: Topic[]): Topic[] =>
      addVote(topics, topic.topicName, currentUser),
    );
  }
};

export const addTopicToList = async (
  data: NewTopicData,
  currentUser: string,
  storeTopics: StoreTopicsFunction,
): Promise<void> => {
  await storeTopics((topics: Topic[]): Topic[] => {
    topics.push({
      creator: currentUser,
      topicName: data.topic,
      voters: [],
      votes: 0,
    });

    return topics;
  });
};
