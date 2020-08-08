import { Theme, ThemeOptions } from "@material-ui/core/styles/createMuiTheme"
import { EditorState } from "./editor/types"

export interface RootState {
  editor: EditorState
  themeId: string
  themeObject: Theme
  themeOptions: ThemeOptions
  savedThemes: Record<string, SavedTheme>
  loadedFonts: Set<string>
  activeTab: string
}

export type SavedTheme = {
  id: string
  name: string
  themeOptions: ThemeOptions
  fonts: string[]
}

export type NewSavedTheme = Omit<SavedTheme, "id">
