import ForgeUI, { Tooltip, Heading, Form, TextField, render, Fragment, Macro, Text,
useProductContext, useState, Table, Head, Row, Cell, Button, ModalDialog } from
"@forge/ui";
import api, {route} from "@forge/api";
import { useStorage } from "./storage";



const fetchCommentsForContent = async (contentId) => {
  const res = await api
    .asUser()
    .requestConfluence(route`/wiki/rest/api/content/${contentId}/child/comment`);

  const data = await res.json();
  return data.results;
};

const addTopicToList = (topics, data, currentUser, storeTopics) => {
  topics.push({topic: data.topic, votes: 0, voters: [], creator: currentUser});
  (async() => { storeTopics(topics) })(); 
};



const Modal = (topics, isOpen, setOpen, currentUser, storeTopics) => {
  const [size, setSize] = useState("medium");
  return isOpen && (
        <ModalDialog header="Suggest a topic" onClose={() => setOpen(false)}>
          <Form
            onSubmit={data => {
              addTopicToList(topics, data, currentUser, storeTopics);
              setOpen(false);
            }}
          >
          <TextField label="topic" name="topic" />
          </Form>
        </ModalDialog>
  );
};

const addTopic = (setOpen) => {
  setOpen(true);
};


const deleteTopic = (topics, topic, updateTopics, storeTopics) => {
  const idx = topics.indexOf(topic);
  console.log("index: "+idx);
  if (idx >= 0) {
    topics.splice(idx, 1)
  }


  (async () => { storeTopics(topics) }) ();
  updateTopics(topics)
};


function addVote(topics, topic, currentUser) {
  topic["votes"] +=1;
  topic["voters"].push(currentUser);
};

function removeVote(topics, topic, currentUser) {
  topic["votes"] -=1;
  const idx = topic["voters"].indexOf(currentUser);
  if (idx >= 0) {
    topic["voters"].splice(idx, 1);
  }
};



const updateVote = (topics, topic, updateTopics, currentUser, storeTopics) => {
  if (topic["voters"].includes(currentUser)) {
    removeVote(topics, topic, currentUser);
  } else {
    addVote(topics, topic, currentUser);
  }

  (async () => { storeTopics(topics) }) ();
  updateTopics(topics)
};


const VoteButton = ({ topic, currentUser, onClick }) => {
  const icon = topic["voters"].includes(currentUser) ? "👎" : "👍";
  return <Button text={icon} appearance="subtle" onClick={onClick}/>
};

const RankingTable = ({ topics, setModalOpen, updateTopics, currentUser, storeTopics }) => {
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
       {
         topics.sort((a,b) => b.votes - a.votes).map(entry => (
           <Row>
             <Cell>
               <Text>{entry.topic}</Text>
             </Cell>
             <Cell>
               { (entry.creator == currentUser) && 
                 (
                   <Button text="🗑️" appearance="subtle" onClick={() => deleteTopic(topics, entry, updateTopics, storeTopics)}/>
                 )
               }
             </Cell>
             <Cell>
               <Text>{entry.votes}</Text>
             </Cell>
             <Cell>
               <VoteButton topic={entry} currentUser={currentUser} onClick={() => updateVote(topics, entry, updateTopics, currentUser, storeTopics)}/>
             </Cell>
           </Row>
         ))
       }
     </Table>
     <Button text="➕ Add a topic" onClick={() => {addTopic(setModalOpen);}}/>
     </Fragment>
  );
};



const App = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const context = useProductContext();
  //console.log(context);
  const currentUser = context.accountId;
  const spaceKey = context.spaceKey;
  const contentId = context.contentId;
  const localId = context.localId;

  const { fetchTopics, storeTopics } = useStorage(spaceKey, contentId, localId);

  console.log("current User: "+ currentUser);
  const [topics, updateTopics] = useState(async () => await fetchTopics());
  console.log(topics);

  return (
    <Fragment>
      <RankingTable topics={topics} setModalOpen={setModalOpen} updateTopics={updateTopics} currentUser={currentUser} storeTopics={storeTopics} />
      {Modal(topics, isModalOpen, setModalOpen, currentUser, storeTopics)}
    </Fragment>
    ); 
};

export const run = render(
  <Macro
    app={<App />}
  />
);
