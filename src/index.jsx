import ForgeUI, {
  Tooltip,
  Heading,
  Form,
  TextField,
  render,
  Fragment,
  Macro,
  Text,
  useProductContext,
  useState,
  Table,
  Head,
  Row,
  Cell,
  Button,
  ModalDialog,
} from "@forge/ui";
import api, { route } from "@forge/api";
import { useStorage } from "./storage";

const addTopicToList = async (data, currentUser, storeTopics) => {
  await storeTopics((topics) => {
    topics.push({
      topicName: data.topic,
      votes: 0,
      voters: [],
      creator: currentUser,
    });
    return topics;
  });
};

const Modal = (topics, isOpen, setOpen, currentUser, storeTopics) => {
  return (
    isOpen && (
      <ModalDialog header="Suggest a topic" onClose={() => {setOpen(false);}}>
        <Form
          onSubmit={async (data) => {
            await addTopicToList(data, currentUser, storeTopics);
            setOpen(false);
          }}
        >
          <TextField label="topic" name="topic" />
        </Form>
      </ModalDialog>
    )
  );
};

const addTopic = (setOpen) => {
  setOpen(true);
};

const deleteTopic = async (topic, storeTopics) => {
  // console.log("topic:", topic);
  await storeTopics((topics) => {
    let idx = -1;
    for (let i = 0; i < topics.length; ++i) {
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

function addVote(topics, topicName, currentUser) {
  for (const topic of topics) {
    if (
      topic.topicName === topicName &&
      !topic.voters.includes(currentUser)
    ) {
      topic.votes += 1;
      topic.voters.push(currentUser);
    }
  }
  return topics;
}

function removeVote(topics, topicName, currentUser) {
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
}

const updateVote = async (topic, currentUser, storeTopics) => {
  // console.log(topic);
  if (topic.voters.includes(currentUser)) {
    await storeTopics((topics) => {
      return removeVote(topics, topic.topicName, currentUser);
    });
  } else {
    await storeTopics((topics) => {
      return addVote(topics, topic.topicName, currentUser);
    });
  }
};

const VoteButton = ({ topic, currentUser, onClick }) => {
  const icon = topic.voters.includes(currentUser) ? "👎" : "👍";
  return <Button text={icon} appearance="subtle" onClick={onClick} />;
};

const RankingTable = ({ topics, setModalOpen, currentUser, storeTopics }) => {
  return (
    <Fragment>
      <Table>
        <Head>
          <Cell>
            <Heading size="large">Topic</Heading>
          </Cell>
          <Cell></Cell>
          <Cell>
            <Heading size="large">Votes</Heading>
          </Cell>
          <Cell></Cell>
        </Head>
        {topics
          .sort((a, b) => b.votes - a.votes)
          .map((entry) => (
            <Row>
              <Cell>
                <Text>{entry.topicName}</Text>
              </Cell>
              <Cell>
                {entry.creator === currentUser && (
                  <Button
                    text="🗑️"
                    appearance="subtle"
                    onClick={async () => await deleteTopic(entry, storeTopics)}
                  />
                )}
              </Cell>
              <Cell>
                <Text>{entry.votes}</Text>
              </Cell>
              <Cell>
                <VoteButton
                  topic={entry}
                  currentUser={currentUser}
                  onClick={async () =>
                    await updateVote(entry, currentUser, storeTopics)
                  }
                />
              </Cell>
            </Row>
          ))}
      </Table>
      <Button
        text="➕ Add a topic"
        onClick={() => {
          addTopic(setModalOpen);
        }}
      />
    </Fragment>
  );
};

const App = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const context = useProductContext();
  const currentUser = context.accountId;
  const spaceKey = context.spaceKey;
  const contentId = context.contentId;
  const localId = context.localId;

  const { topics, storeTopics } = useStorage(spaceKey, contentId, localId);

  return (
    <Fragment>
      <RankingTable
        topics={topics}
        setModalOpen={setModalOpen}
        currentUser={currentUser}
        storeTopics={storeTopics}
      />
      {Modal(topics, isModalOpen, setModalOpen, currentUser, storeTopics)}
    </Fragment>
  );
};

export const run = render(<Macro app={<App />} />);
