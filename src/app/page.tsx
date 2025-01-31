"use client";

import AdalineMessage from "@/components/AdalineMessage";
import { useList } from "@uidotdev/usehooks";
import { useState } from "react";

const DEFAULT_MESSAGES = [
  {
    role: "system",
    content: `You are a {{ persona }}. who plays concerts with the passion of a poet and the precision of a surgeon, turning every performance into a masterpiece.You are a medical professional assisting a physician.

Given the {document} by the doctor which provides the complete medical record text, including patient history, diagnoses, lab results, medications, etc., your task is to:

1. Analyze the provided medical record.
2. Extract the most important information, including:
    * **Patient demographics:** Age, gender, etc.
    * **Primary diagnoses and medical history:**  Major illnesses, chronic conditions, surgeries.
    * **Current medications and allergies:** List all active medications and known allergies.
    * **Recent lab results and vital signs:** Summarize significant findings.
    * **Treatment plans and upcoming appointments:** Outline ongoing treatments and scheduled appointments.
3. Generate a concise and informative summary of the patient's medical record, highlighting key findings and potential concerns.
4. Present the summary in a clear and organized format, suitable for a physician to quickly grasp the patient's situation.

Below is the sample conversation:

Assistant: Hi Doc., I am here to assist you. Can you provide the medical report of the patient?
User yes, here is it.
Assistant:  Analysing the {document}.

Here are the report of the document:
-----------------------------------------------------------
Patient: [Patient Name], [Age], [Gender]
Primary Diagnosis: [Diagnosis]
Medical History: [Summarized history]
Current Medications: [List of medications]
Allergies: [List of allergies]
Recent Lab Results: [Key findings]
Treatment Plan: [Summarized plan]
Upcoming Appointments: [List of appointments]
    `,
  },
  {
    role: "user",
    content: `yikes`,
  },
  {
    role: "user",
    content: `test`,
  },
];

export default function Home() {
  const [selectionId, setSelectionId] = useState(0);
  const [selectionLevel, setSelectionLevel] = useState<"text" | "message">(
    "text",
  );
  const [cursorPositionGlobal, setCursorPositionGlobal] = useState({
    x: 0,
    y: 0,
  });

  const [messages, { push, removeAt, insertAt, updateAt, clear }] =
    useList(DEFAULT_MESSAGES);

  const isSelectingLastMessage = selectionId === messages.length - 1;
  const lastMessage = messages[messages.length - 1];
  const isLastMessageEmpty = lastMessage.content === "";

  return (
    <div className="max-w-[50vw] mx-auto my-12">
      {messages.map((message, index) => (
        <AdalineMessage
          setSelectionLevel={setSelectionLevel}
          selectionLevel={selectionLevel}
          messageId={index}
          key={index}
          setSelection={setSelectionId}
          currentSelection={selectionId}
          isLastMessage={index === messages.length - 1}
          role={message.role}
          onDeleteMessage={(textCursor) => {
            removeAt(index);
            setCursorPositionGlobal(textCursor);
            setSelectionId(index - 1);
          }}
          onChange={(newMessage) => {
            updateAt(index, {
              role: message.role,
              content: newMessage,
            });
          }}
          onNextMessageContent={(textCursor) => {
            if (isSelectingLastMessage && !isLastMessageEmpty) {
              push({
                role: "user",
                content: "",
              });
              setSelectionId(index + 1);
              setSelectionLevel("text");
              return;
            }
            setCursorPositionGlobal(textCursor);
            setSelectionId(index + 1);
          }}
          onPrevMessageContent={(textCursor) => {
            setCursorPositionGlobal(textCursor);
            setSelectionId(index - 1);
          }}
          cursorPosition={cursorPositionGlobal}
        >
          {message.content}
        </AdalineMessage>
      ))}
      <div className="text-sm opacity-50">
        {isSelectingLastMessage && !isLastMessageEmpty
          ? "'Arrow Down' for New Message"
          : ""}
      </div>
    </div>
  );
}
