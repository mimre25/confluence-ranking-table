import api, { route } from "@forge/api";
import ForgeUI, {
  MacroConfig,
  Option,
  render,
  Select,
  TextField,
  useAction,
  useEffect,
  useState,
} from "@forge/ui";

export enum DeletionMode {
  CreatorOnly,
  Everyone,
}

interface DeletionModeEntry {
  name: string;
  value: DeletionMode;
}

const DELETION_MODES = [
  {
    name: "Creator",
    value: DeletionMode.CreatorOnly,
  },
  {
    name: "Everyone",
    value: DeletionMode.Everyone,
  },
];

export interface AdminConfig {
  deletionMode: DeletionMode;
}
export const defaultConfig: AdminConfig = {
  deletionMode: DeletionMode.CreatorOnly,
};

// tslint:disable-next-line: no-any
type ForgeComponent = any;

interface User {
  accountId: string;
  username: string;
}
// tslint:disable-next-line: variable-name
const Config = (): ForgeComponent => (
  <MacroConfig>
    <Select name="deletionMode" label="Deletion Mode">
      {DELETION_MODES.map(
        (mode: DeletionModeEntry): ForgeComponent => (
          <Option label={mode.name} value={mode.value} />
        ),
      )}
    </Select>
  </MacroConfig>
);

export const run = render(<Config />);
