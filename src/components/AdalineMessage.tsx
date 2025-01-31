"use client";
import ReactCodeMirror, {
  EditorSelection,
  EditorView,
  ViewUpdate,
} from "@uiw/react-codemirror";
import React, { useCallback, useEffect, useRef, useState } from "react";
import createTheme from "@uiw/codemirror-themes";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror/cjs/index.js";
import { IconAddImage } from "./IconAddImage";
import { IconAddTool } from "./IconAddTool";
import { IconDeleteMessage } from "./IconDeleteMessage";
import { useHotkeys } from "react-hotkeys-hook";

//@ts-expect-error your mom
const myTheme = createTheme({
  theme: "dark",
  settings: {
    background: "rgba(0,0,0,0)",
    backgroundImage: "",
    foreground: "#CCC",
    caret: "#FFF",
    selection: "#036dd626",
    selectionMatch: "#036dd626",
    lineHighlight: "#8a91991a",
    gutterBackground: "#fff",
    gutterForeground: "#8a919966",
  },
});

interface Props {
  currentSelection: number;
  selectionLevel: "text" | "message";
  setSelectionLevel: (level: "text" | "message") => void;
  setSelection: (selection: number) => void;
  messageId: number;
  children: string;
  isLastMessage: boolean;
  role: string;
  onNextMessageContent: (pos: { x: number; y: number }) => void;
  onPrevMessageContent: (pos: { x: number; y: number }) => void;
  onInsertAfter: (pos: { x: number; y: number }) => void;
  cursorPosition: { x: number; y: number };
  onChange: (message: string) => void;
  onDeleteMessage: (pos: { x: number; y: number }) => void;
}

const AdalineMessage = ({
  children,
  currentSelection,
  setSelection,
  messageId,
  onNextMessageContent: onNextMessage,
  onPrevMessageContent: onPrevMessage,
  selectionLevel,
  setSelectionLevel,
  cursorPosition,
  role,
  onChange,
  onDeleteMessage,
  onInsertAfter,
}: Props) => {
  const [isHovering, setIsHovering] = useState(false);
  const isFocused = currentSelection === messageId;

  const [isTextareaFocused, setIsTextareaFocused] = useState(false);

  const isGrabbed = isFocused && !isTextareaFocused;

  // const setCurrentCursorPosition = (pos: number) => {
  //   console.log(pos);
  // };
  // Ref to hold the CodeMirror editor instance
  const editorRef = useRef<ReactCodeMirrorRef | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (
      !editor ||
      editor.view === undefined ||
      !isFocused ||
      selectionLevel === "message"
    )
      return;
    editor.view?.focus();

    const editorTop = editor.view?.documentTop;
    const editorHeight = editor.view?.contentHeight;
    const editorLineHeight = editor.view.defaultLineHeight;
    if (editorTop === undefined || editorHeight === undefined) return;

    const isFromMessageBefore = cursorPosition.y < editorTop;
    const firstLineY = editorTop;
    const lastLineY = editorTop + editorHeight - editorLineHeight;

    const selectionPos = editor.view.posAtCoords(
      {
        x: cursorPosition.x,
        y: isFromMessageBefore ? firstLineY : lastLineY,
      },
      false,
    );

    editor.view.dispatch({
      selection: EditorSelection.create([EditorSelection.cursor(selectionPos)]),
    });
  }, [isFocused, editorRef.current?.state]);

  // const [codeEditorCoord, setCodeEditorCoord] = useState({ x: 0, y: 0 });
  const [codeEditorCoordX, setCodeEditorCoordX] = useState(0);
  const [codeEditorCoordY, setCodeEditorCoordY] = useState(0);
  const [headPos, setHeadPos] = useState(0);

  const [isFirstLine, setIsFirstLine] = useState(true);
  const [isLastLine, setIsLastLine] = useState(true);

  const updateCodeMirror = useCallback((updateInfo: ViewUpdate) => {
    const head = updateInfo.state?.selection.main.to;
    const coordAtHead = updateInfo.view?.coordsForChar(head);

    setHeadPos(head);

    if (updateInfo.state.doc.length === 0) {
      setCodeEditorCoordY(updateInfo.view.documentTop);
      setCodeEditorCoordX(updateInfo.view.dom.getBoundingClientRect().left);
      return;
    }

    if (!coordAtHead) {
      // the last character
      const charBefore = updateInfo.view.coordsForChar(head - 1);
      if (!charBefore) return;
      setCodeEditorCoordX(charBefore.right);
      setIsLastLine(true);
    }

    if (coordAtHead) {
      const { left, top } = coordAtHead;

      setCodeEditorCoordX(left);
      setCodeEditorCoordY(top);

      // Accessing the viewport height and the scroll position
      const viewportHeight = updateInfo.view.dom.clientHeight;
      const elmTop = updateInfo.view.documentTop;
      const scrollTop = updateInfo.view.dom.scrollTop;

      // Calculate the line index based on the scroll position and height of the editor
      const yPos = top - elmTop + scrollTop;
      const wrappedLineNumber = Math.floor(
        yPos / updateInfo.view.defaultLineHeight,
      );
      const totalSoftLines = Math.floor(
        viewportHeight / updateInfo.view.defaultLineHeight,
      );

      if (wrappedLineNumber === 0) {
        setIsFirstLine(true);
      } else {
        setIsFirstLine(false);
      }

      if (wrappedLineNumber === totalSoftLines - 1) {
        setIsLastLine(true);
      } else {
        setIsLastLine(false);
      }
    }
  }, []);

  useHotkeys("Enter", () => {
    if (isTextareaFocused === false && isFocused) {
      setIsTextareaFocused(true);
      editorRef.current?.view?.focus();
      setSelectionLevel("text");
    }
  });

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => {
        setSelectionLevel("message");
        setSelection(messageId);
      }}
      className={`${isGrabbed ? "cursor-default" : "cursor-default"} w-full py-2 ${isGrabbed ? "bg-gray-800" : ""}`}
      style={
        {
          // borderTop: isHovering ? "solid 1px #222" : "solid 1px rgba(0,0,0,0)",
          // borderBottom: isHovering ? "solid 1px #222" : "solid 1px rgba(0,0,0,0)",
        }
      }
    >
      <div
        className={`border-l-2 pl-3.5  ${isFocused ? "border-l-white" : "border-l-gray-600"}`}
      >
        <div className="text-sm flex flex-row opacity-50 mb-2">
          <span className="cursor-pointer">{role}</span>
          <div
            className="ml-auto flex flex-row"
            style={{
              display: isHovering || isFocused ? "flex" : "none",
            }}
          >
            <IconAddImage />
            <IconAddTool />
            <IconDeleteMessage />
          </div>
        </div>

        <ReactCodeMirror
          ref={editorRef}
          value={children}
          className="w-full cursor-text"
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLine: false,
          }}
          extensions={[EditorView.lineWrapping]}
          theme={myTheme}
          onFocus={() => setIsTextareaFocused(true)}
          onBlur={() => setIsTextareaFocused(false)}
          onChange={onChange}
          onUpdate={updateCodeMirror}
          onKeyDownCapture={(e) => {
            if (
              e.key === "Backspace" &&
              headPos === 0 &&
              children.length === 0
            ) {
              onDeleteMessage({
                x: codeEditorCoordX,
                y: codeEditorCoordY,
              });

              e.preventDefault();
            }

            // if (e.key === "Enter" && isLastLine) {
            //   const isLast3LinesEmpty = children
            //     .split("\n")
            //     .slice(-3)
            //     .every((line) => !line.trim());
            //   onInsertAfter({
            //     x: codeEditorCoordX,
            //     y: codeEditorCoordY,
            //   });
            //   e.preventDefault();
            // }

            if (e.key === "ArrowDown" && isLastLine) {
              // Handle exit bottom if necessary
              onNextMessage({
                x: codeEditorCoordX,
                y: codeEditorCoordY,
              });
              setSelectionLevel("text");
            }
            if (e.key === "ArrowUp" && isFirstLine) {
              // Handle exit top if necessary
              onPrevMessage({
                x: codeEditorCoordX,
                y: codeEditorCoordY,
              });
              setSelectionLevel("text");
            }

            if (e.key === "Escape") {
              setIsTextareaFocused(false);
              editorRef.current?.view?.contentDOM.blur();
              setSelectionLevel("message");
            }
          }}
        />
      </div>
    </div>
  );
};

export default AdalineMessage;
