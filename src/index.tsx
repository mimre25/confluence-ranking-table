import ForgeUI, {
  Button,
  Cell,
  Form,
  Fragment,
  Head,
  Heading,
  Macro,
  ModalDialog,
  render,
  Row,
  Table,
  Text,
  TextField,
  useConfig,
  useProductContext,
  User,
  useState,
} from "@forge/ui";

import { AdminConfig, defaultConfig, DeletionMode } from "./config";
import {
  StoreTopicsFunction,
  useStorage,
  UseStorageInterface,
} from "./storage";
import {
  addTopicToList,
  deleteTopic,
  NewTopicData,
  Topic,
  updateVote,
} from "./topicHandling";

// tslint:disable-next-line: no-any
type ForgeComponent = any;

type OnClickFunction = () => Promise<void>;

const evaluateDeletion = (
  deletionMode: DeletionMode,
  creator: string,
  currentUser: string,
): boolean =>
  deletionMode === DeletionMode.Everyone ||
  (deletionMode === DeletionMode.CreatorOnly && creator === currentUser);

// tslint:disable-next-line:variable-name
const Modal = (
  topics: Topic[],
  isOpen: boolean,
  setOpen: (b: boolean) => void,
  currentUser: string,
  storeTopics: StoreTopicsFunction,
): ForgeComponent | boolean =>
  // tslint:disable-next-line:strict-boolean-expressions
  isOpen && (
    <ModalDialog
      header="Suggest a topic"
      onClose={(): void => {
        setOpen(false);
      }}
    >
      <Form
        onSubmit={async (data: NewTopicData): Promise<void> => {
          await addTopicToList(data, currentUser, storeTopics);
          setOpen(false);
        }}
      >
        <TextField label="topic" name="topic" />
      </Form>
    </ModalDialog>
  );

// tslint:disable-next-line:variable-name
const VoteButton = ({
  topic,
  currentUser,
  onClick,
}: {
  currentUser: string;
  onClick: OnClickFunction;
  topic: Topic;
}): ForgeComponent => {
  const icon = topic.voters.includes(currentUser) ? "👎" : "👍";

  return <Button text={icon} appearance="subtle" onClick={onClick} />;
};

// tslint:disable-next-line:variable-name
const RankingTable = ({
  topics,
  setModalOpen,
  currentUser,
  storeTopics,
  deletionMode,
}: {
  currentUser: string;
  deletionMode: DeletionMode;
  storeTopics: StoreTopicsFunction;
  topics: Topic[];
  setModalOpen(b: boolean): void;
}): ForgeComponent => (
  <Fragment>
    <Table>
      <Head>
        <Cell>
          <Heading size="large">Topic</Heading>
        </Cell>
        <Cell>
          <Heading size="large">Added by</Heading>
        </Cell>
        <Cell></Cell>
        <Cell>
          <Heading size="large">Votes</Heading>
        </Cell>
        <Cell></Cell>
      </Head>
      {topics
        .sort((a: Topic, b: Topic): number => b.votes - a.votes)
        .map(
          (entry: Topic): ForgeComponent => (
            <Row>
              <Cell>
                <Text>{entry.topicName}</Text>
              </Cell>
              <Cell>
                <User accountId={entry.creator} />
              </Cell>
              <Cell>
                {
                  // tslint:disable-next-line:strict-boolean-expressions
                  evaluateDeletion(
                    deletionMode,
                    entry.creator,
                    currentUser,
                  ) && (
                    <Button
                      text="🗑️"
                      appearance="subtle"
                      onClick={async (): Promise<void> =>
                        deleteTopic(entry, storeTopics)
                      }
                    />
                  )
                }
              </Cell>
              <Cell>
                <Text>{entry.votes}</Text>
              </Cell>
              <Cell>
                <VoteButton
                  topic={entry}
                  currentUser={currentUser}
                  onClick={async (): Promise<void> => {
                    await updateVote(entry, currentUser, storeTopics);
                  }}
                />
              </Cell>
            </Row>
          ),
        )}
    </Table>
    <Button
      text="➕ Add a topic"
      onClick={(): void => {
        setModalOpen(true);
      }}
    />
  </Fragment>
);

// tslint:disable-next-line:variable-name
const App = (): ForgeComponent => {
  const [isModalOpen, setModalOpen]: [b: boolean, f: (x: boolean) => void] =
    useState(false);
  const context = useProductContext();
  const currentUser = context.accountId as string;
  const spaceKey = context.spaceKey as string;
  const contentId = context.contentId as string;
  const localId = context.localId as string;

  const { topics, storeTopics }: UseStorageInterface = useStorage(
    spaceKey,
    contentId,
    localId,
  );

  const config: AdminConfig = (useConfig() as AdminConfig) || defaultConfig;

  return (
    <Fragment>
      <RankingTable
        topics={topics}
        setModalOpen={setModalOpen}
        currentUser={currentUser}
        storeTopics={storeTopics}
        deletionMode={config.deletionMode}
      />
      {
        // tslint:disable-next-line: no-unsafe-any
        Modal(topics, isModalOpen, setModalOpen, currentUser, storeTopics)
      }
    </Fragment>
  );
};

export const run = render(<Macro app={<App />} />);
