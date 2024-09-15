"use client";

import { useState, useCallback, useEffect } from "react";
import {
  CodeXmlIcon,
  CopyCheckIcon,
  CopyIcon,
  Loader2,
  MinimizeIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { LiveProvider, LiveError, LivePreview } from "react-live";
import { Create } from "./components/Create";
import { schema } from "./api/generate/schema";

export type JSX = {
  id: number;
  jsx: string;
};

export function MainContent() {
  const [JSXs, setJSXs] = useState<JSX[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const selectedJSXList = selectedIds.map(
    (id) => JSXs.find((jsx) => jsx.id === id)!,
  );

  return (
    <div className="flex h-full min-h-full flex-col items-center justify-between">
      <div className="w-full flex-grow pb-[100px]">
        {JSXs.length > 0 ? (
          <JSXDisplay
            JSXs={JSXs}
            setJSXs={setJSXs}
            selectedJSXs={selectedIds}
            setSelectedJSXs={setSelectedIds}
            selectedJSXList={selectedJSXList}
          />
        ) : (
          <EmptyState />
        )}
      </div>
      <div className="absolute bottom-[80px]">
        <Create selectedJSXs={selectedJSXList} setJSXs={setJSXs} />
      </div>
    </div>
  );
}

function EmptyState() {
  return <div className="text-2xl opacity-40">The input is down there ⬇️</div>;
}

function JSXDisplay({
  JSXs,
  setJSXs,
  selectedJSXs,
  setSelectedJSXs,
  selectedJSXList,
}: {
  JSXs: JSX[];
  setJSXs: React.Dispatch<React.SetStateAction<JSX[]>>;
  selectedJSXs: number[];
  setSelectedJSXs: React.Dispatch<React.SetStateAction<number[]>>;
  selectedJSXList: JSX[];
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [inspectedId, setInspectedId] = useState<number | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const { submit: breed, isLoading: isBreeding } = useObject({
    schema: schema,
    api: "/api/generate",
    onFinish: ({ object }) => {
      if (!object) return;
      const newButton = {
        ...object,
        id: Math.floor(Math.random() * 1000000),
      };
      setJSXs((prev) => [...prev, newButton]);
      setSelectedJSXs([]);
    },
  });

  const deleteSelected = useCallback(async () => {
    setIsDeleting(true);
    setJSXs((prev) => prev.filter((jsx) => !selectedJSXList.includes(jsx)));
    setSelectedJSXs([]);
    setIsDeleting(false);
  }, [setJSXs, selectedJSXList, setSelectedJSXs]);

  const breedSelected = useCallback(() => {
    breed({
      prompt: `Generate the next (more interesting) JSX in the sequence: ${selectedJSXList
        .map((jsx, i) => `v${i}: jsx=\`${jsx.jsx}\``)
        .join("\n")}`,
    });
  }, [breed, selectedJSXList]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "a") {
        event.preventDefault();
        setSelectedJSXs(
          selectedJSXs.length === JSXs.length ? [] : JSXs.map((jsx) => jsx.id),
        );
      }
      if (
        event.key === "Backspace" &&
        confirm("Are you sure you want to delete the selected elements?")
      ) {
        deleteSelected();
      }
      if (event.key === "Enter") {
        breedSelected();
      }
      if (event.key === "Escape") {
        setSelectedJSXs([]);
      }
    },
    [JSXs, selectedJSXs, breedSelected, setSelectedJSXs, deleteSelected],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (inspectedId && !selectedJSXs.includes(inspectedId)) {
      setInspectedId(null);
    }
  }, [selectedJSXs, inspectedId]);

  return (
    <div className="flex flex-col items-center justify-center gap-y-2">
      <JSXGrid JSXs={JSXs} setSelectedJSXs={setSelectedJSXs} />
      {selectedJSXList.length > 0 && (
        <>
          <SelectedJSXDisplay
            selectedJSXList={selectedJSXList}
            setSelectedJSXs={setSelectedJSXs}
            inspectedId={inspectedId}
            setInspectedId={setInspectedId}
            setJSXs={setJSXs}
            copySuccess={copySuccess}
            setCopySuccess={setCopySuccess}
          />
          <ActionButtons
            isDeleting={isDeleting}
            isBreeding={isBreeding}
            deleteSelected={deleteSelected}
            breedSelected={breedSelected}
          />
        </>
      )}
    </div>
  );
}

function JSXGrid({
  JSXs,
  setSelectedJSXs,
}: {
  JSXs: JSX[];
  setSelectedJSXs: React.Dispatch<React.SetStateAction<number[]>>;
}) {
  return (
    <div className="flex flex-row flex-wrap items-center gap-2 text-black dark:text-white">
      {JSXs.map((jsx) => (
        <div
          key={jsx.id}
          onClick={() => {
            setSelectedJSXs((prev) => {
              if (prev.includes(jsx.id)) {
                return prev.filter((id) => id !== jsx.id);
              }
              return [...prev, jsx.id];
            });
          }}
        >
          <LiveProvider code={jsx.jsx}>
            <LiveError />
            <LivePreview />
          </LiveProvider>
        </div>
      ))}
    </div>
  );
}

function SelectedJSXDisplay({
  selectedJSXList,
  setSelectedJSXs,
  inspectedId,
  setInspectedId,
  setJSXs,
  copySuccess,
  setCopySuccess,
}: {
  selectedJSXList: JSX[];
  setSelectedJSXs: React.Dispatch<React.SetStateAction<number[]>>;
  inspectedId: number | null;
  setInspectedId: React.Dispatch<React.SetStateAction<number | null>>;
  setJSXs: React.Dispatch<React.SetStateAction<JSX[]>>;
  copySuccess: boolean;
  setCopySuccess: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="margin-auto flex w-full flex-col items-center justify-center gap-y-2">
      <div className="flex scale-75 flex-row gap-2 overflow-x-auto bg-white/60 p-4">
        {selectedJSXList.map((jsx) => (
          <SelectedJSXItem
            key={jsx.id}
            jsx={jsx}
            setSelectedJSXs={setSelectedJSXs}
            inspectedId={inspectedId}
            setInspectedId={setInspectedId}
            setJSXs={setJSXs}
            copySuccess={copySuccess}
            setCopySuccess={setCopySuccess}
          />
        ))}
      </div>
      {inspectedId && (
        <InspectedJSXEditor
          jsx={selectedJSXList.find((jsx) => jsx.id === inspectedId)!}
          setInspectedId={setInspectedId}
          setJSXs={setJSXs}
          copySuccess={copySuccess}
          setCopySuccess={setCopySuccess}
        />
      )}
    </div>
  );
}

function SelectedJSXItem({
  jsx,
  setSelectedJSXs,
  setInspectedId,
}: {
  jsx: JSX;
  setSelectedJSXs: React.Dispatch<React.SetStateAction<number[]>>;
  setInspectedId: React.Dispatch<React.SetStateAction<number | null>>;
}) {
  return (
    <div className="group relative min-w-[100px]">
      <div className="border-2 border-zinc-300 bg-black/10 p-2">
        <LiveProvider code={jsx.jsx}>
          <LiveError />
          <LivePreview />
        </LiveProvider>
      </div>
      <JSXItemMenu
        jsx={jsx}
        setSelectedJSXs={setSelectedJSXs}
        setInspectedId={setInspectedId}
      />
    </div>
  );
}

function JSXItemMenu({
  jsx,
  setSelectedJSXs,
  setInspectedId,
}: {
  jsx: JSX;
  setSelectedJSXs: React.Dispatch<React.SetStateAction<number[]>>;
  setInspectedId: React.Dispatch<React.SetStateAction<number | null>>;
}) {
  return (
    <div
      className="menu absolute left-0 top-0 flex size-full cursor-help items-start justify-end pr-1 pt-1 group-hover:visible md:invisible"
      onClick={() =>
        setInspectedId((prev) => (prev === jsx.id ? null : jsx.id))
      }
    >
      <MinimizeIcon
        className="size-8 cursor-help bg-white/20 hover:scale-110"
        onClick={(e) => {
          setSelectedJSXs((prev) => prev.filter((id) => id !== jsx.id));
          e.stopPropagation();
        }}
      />
    </div>
  );
}

function InspectedJSXEditor({
  jsx,
  setInspectedId,
  setJSXs,
  copySuccess,
  setCopySuccess,
}: {
  jsx: JSX;
  setInspectedId: React.Dispatch<React.SetStateAction<number | null>>;
  setJSXs: React.Dispatch<React.SetStateAction<JSX[]>>;
  copySuccess: boolean;
  setCopySuccess: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="relative flex flex-col gap-2 border-zinc-300 bg-black/80">
      <XIcon
        className="absolute right-2 top-2 size-8 cursor-pointer rounded-md hover:scale-110"
        onClick={() => setInspectedId(null)}
      />
      <CodeEditor
        value={jsx.jsx}
        language="jsx"
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          setJSXs((prev) =>
            prev.map((item) =>
              item.id === jsx.id ? { ...item, jsx: e.target.value } : item,
            ),
          );
        }}
      />
      <div className="flex justify-end gap-2 p-2">
        <CopyButton
          jsx={jsx}
          copySuccess={copySuccess}
          setCopySuccess={setCopySuccess}
        />
      </div>
    </div>
  );
}

function CopyButton({
  jsx,
  copySuccess,
  setCopySuccess,
}: {
  jsx: JSX;
  copySuccess: boolean;
  setCopySuccess: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  if (copySuccess) {
    return (
      <CopyCheckIcon
        className={`size-8 scale-110 cursor-none rounded-md text-green-300 transition-all duration-500`}
      />
    );
  }
  return (
    <CopyIcon
      className="size-8 cursor-pointer rounded-md text-white transition-all duration-500 hover:scale-110"
      onClick={async () => {
        await navigator.clipboard.writeText(jsx.jsx);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 1000);
      }}
    />
  );
}

function ActionButtons({
  isDeleting,
  isBreeding,
  deleteSelected,
  breedSelected,
}: {
  isDeleting: boolean;
  isBreeding: boolean;
  deleteSelected: () => void;
  breedSelected: () => void;
}) {
  return (
    <div className="flex flex-row gap-2">
      <button
        className="flex size-8 items-center justify-center rounded-full bg-red-500 p-1 text-white hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-red-500"
        onClick={deleteSelected}
        disabled={isDeleting || isBreeding}
      >
        {isDeleting ? (
          <Loader2 className="size-8 animate-spin" />
        ) : isBreeding ? null : (
          <XIcon className="size-8" />
        )}
      </button>
      <button
        className="flex size-8 items-center justify-center rounded-full bg-green-500 p-1 text-white hover:bg-green-600 disabled:opacity-50 disabled:hover:bg-green-500"
        onClick={breedSelected}
        disabled={isDeleting || isBreeding}
      >
        {isBreeding ? (
          <Loader2 className="size-8 animate-spin" />
        ) : isDeleting ? null : (
          <PlusIcon className="size-8" />
        )}
      </button>
    </div>
  );
}
