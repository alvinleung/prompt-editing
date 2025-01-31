import { useClickAway } from "@uidotdev/usehooks";
import React, { useEffect, useRef, useState } from "react";

interface AutoExpandingTextareaProps {
  className?: string;
  children?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onCursorAtFirstLine?: () => void;
  onCursorAtLastLine?: () => void;
  onBoundaryExit?: (
    direction: "up" | "down" | "left" | "right",
    position: number,
  ) => void;
  isFocused: boolean;
  cursorPosition: number;
  setCursorPosition: (cursor: number) => void;
}

const AutoExpandingTextarea: React.FC<AutoExpandingTextareaProps> = ({
  className,
  children: value,
  onChange,
  onFocus,
  onBlur,
  onCursorAtFirstLine,
  onCursorAtLastLine,
  onBoundaryExit,
  isFocused,
  cursorPosition,
  setCursorPosition,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [content, setContent] = useState<string>(value || "");

  // Update the content state when the component's value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setContent(value);
    }
  }, [value]);

  // Adjust the height of the textarea based on its scrollHeight
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height to auto to calculate new height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set it to the scrollHeight
    }
  }, [content]);


  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setContent(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const getTextCursorLine = (elm: HTMLTextAreaElement) => {
    const style = window.getComputedStyle(elm);
    const lineHeight = parseInt(style.lineHeight);

    const cursorTop = elm.selectionStart * lineHeight;

    const lineNumber = Math.floor(cursorTop / lineHeight) + 1;
    return lineNumber;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      const { selectionStart, selectionEnd, value } = textareaRef.current;
      const lines = value.split("\n");
      const currentLineIndex =
        value.substring(0, selectionStart).split("\n").length - 1;
      const lastLineIndex = lines.length - 1;

      if (currentLineIndex === 0 && onCursorAtFirstLine) {
        onCursorAtFirstLine();
      }

      if (currentLineIndex === lastLineIndex && onCursorAtLastLine) {
        onCursorAtLastLine();
      }

      if (selectionStart === 0 && event.key === "ArrowUp" && onBoundaryExit) {
        onBoundaryExit("up", selectionStart);
      } else if (
        selectionEnd === value.length &&
        event.key === "ArrowDown" &&
        onBoundaryExit
      ) {
        onBoundaryExit("down", selectionEnd);
      } else if (
        selectionStart === 0 &&
        event.key === "ArrowLeft" &&
        onBoundaryExit
      ) {
        onBoundaryExit("left", selectionStart);
      } else if (
        selectionEnd === value.length &&
        event.key === "ArrowRight" &&
        onBoundaryExit
      ) {
        onBoundaryExit("right", selectionEnd);
      }
    }
  };
  useEffect(() => {
    if (isFocused) {
      textareaRef.current?.focus();
      return;
    }
    textareaRef.current?.blur();
  }, [isFocused]);

  return (
    <textarea
      autoComplete="false"
      ref={textareaRef}
      value={content}
      onChange={handleChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
      className={`resize-none overflow-hidden ${className}`} // Add Tailwind classes here
      rows={1} // Initial row count
      style={{ minHeight: "40px", maxHeight: "500px" }} // Set your desired min and max height
    />
  );
};

export default AutoExpandingTextarea;
