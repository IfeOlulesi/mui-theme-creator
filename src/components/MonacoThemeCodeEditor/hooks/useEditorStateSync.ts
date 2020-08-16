import { useSelector, useDispatch } from "react-redux"
import { useEffect } from "react"
import { RootState } from "src/state/types"

import { EditorRefType } from "../types"
import { useUpdateEditorState } from "src/state/editor/actions"

export default function useEditorStateSync(editorRef: EditorRefType) {
  useSyncToStore(editorRef)
  useSyncFromStore(editorRef)
}

/**
 * ensure that when the code editor is updated,
 * the redux store themeInput is also updated
 */
const useSyncToStore = (editorRef: EditorRefType) => {
  const updateEditorState = useUpdateEditorState()

  useEffect(() => {
    const modelContentChangeBinding = editorRef.current?.onDidChangeModelContent(
      event => {
        console.log("update redux themeInput")
        updateEditorState({ themeInput: editorRef.current?.getValue() })
      }
    )

    return () => {
      modelContentChangeBinding?.dispose()
    }
  }, [])
}

/**
 * ensure that when the redux store themeInput is updated,
 * the code editor is also updated
 */
const useSyncFromStore = (editorRef: EditorRefType) => {
  const themeInput = useSelector((state: RootState) => state.editor.themeInput)
  const updateEditorState = useUpdateEditorState()
  useEffect(() => {
    const model = editorRef.current?.getModel()

    console.log("useSyncThemeInputToEditor", model?.getValue() === themeInput)

    // only modify the editor if themeInput differs from editor,
    // so as to not pollute the undo/redo stack
    if (model?.getValue() !== themeInput) {
      // push the new theme input on to the edit operations stack
      // so that undo stack is preserved
      console.log("previous model version", model?.getAlternativeVersionId())
      // push changes to editor
      model?.pushEditOperations(
        [],
        [{ range: model.getFullModelRange(), text: themeInput }],
        () => null
      )
      // create a new undo/redo "save" point
      model?.pushStackElement()

      console.log("updating saved version", model?.getAlternativeVersionId())

      // update the last saved version after update is applied
      updateEditorState({ savedVersion: model?.getAlternativeVersionId() })
    }
  }, [themeInput])
}