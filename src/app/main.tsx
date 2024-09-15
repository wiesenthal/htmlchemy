"use client";

import { useState, useCallback, useEffect } from "react";
import {
  CodeXmlIcon,
  CopyCheckIcon,
  CopyIcon,
  Loader2,
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
      <div className="w-full flex-grow">
        {JSXs.length > 0 ? (
          <JSXDisplay
            JSXs={JSXs}
            setJSXs={setJSXs}
            selectedJSXs={selectedIds}
            setSelectedJSXs={setSelectedIds}
            selectedJSXList={selectedJSXList}
          />
        ) : (
          <div className="text-2xl opacity-40">The input is down there ⬇️</div>
        )}
      </div>
      <div className="absolute bottom-[80px]">
        <Create selectedJSXs={selectedJSXList} setJSXs={setJSXs} />
      </div>
    </div>
  );
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
  const { submit: breed, isLoading: isBreeding } = useObject({
    schema,
    api: "/api/generate",
    onFinish: async ({ object }) => {
      if (!object) return;
      const newButton = {
        ...object,
        id: Math.floor(Math.random() * 1000000),
      };
      setJSXs((prev) => [...prev, newButton]);
      setSelectedJSXs([]);
    },
  });

  const deleteSelected = () => {
    setIsDeleting(true);
    setJSXs((prev) => prev.filter((jsx) => !selectedJSXList.includes(jsx)));
    setSelectedJSXs([]);
    setIsDeleting(false);
  };

  const breedSelected = () => {
    breed({
      prompt: `Generate the next (more interesting) JSX in the sequence: ${selectedJSXList
        .map((jsx, i) => `v${i}: jsx=\`${jsx.jsx}\``)
        .join("\n")}`,
    });
  };

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
        if (selectedJSXs.length === JSXs.length) {
          setSelectedJSXs([]);
        } else {
          setSelectedJSXs(JSXs.map((jsx) => jsx.id));
        }
      }
      if (event.key === "Backspace") {
        setSelectedJSXs([]);
      }
      if (event.key === "Enter") {
        breedSelected();
      }
      if (event.key === "Escape") {
        setSelectedJSXs([]);
      }
    },
    [JSXs, selectedJSXs, breedSelected, setSelectedJSXs],
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

  const [copySuccess, setCopySuccess] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center gap-y-2">
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
      {selectedJSXList.length > 0 && (
        <div className="margin-auto flex w-full flex-col items-center justify-center gap-y-2 pb-[100px]">
          <div className="flex scale-75 flex-row gap-2 overflow-x-auto bg-white/60 p-4">
            {selectedJSXList.map((jsx) => (
              <div className="group relative min-w-[100px]" key={jsx.id}>
                <div className="border-2 border-zinc-300 bg-black/10 p-2">
                  <LiveProvider code={jsx.jsx}>
                    <LiveError />
                    <LivePreview />
                  </LiveProvider>
                </div>
                <div
                  className="menu absolute left-0 top-0 flex size-full cursor-not-allowed items-start justify-end pr-1 pt-1 group-hover:visible md:invisible"
                  onClick={() =>
                    setSelectedJSXs((prev) =>
                      prev.filter((id) => id !== jsx.id),
                    )
                  }
                >
                  <CodeXmlIcon
                    className="size-8 cursor-help bg-white/20 hover:scale-110"
                    onClick={(e) => {
                      setInspectedId((prev) =>
                        prev === jsx.id ? null : jsx.id,
                      );
                      e.stopPropagation();
                    }}
                  />
                </div>
                {inspectedId === jsx.id ? (
                  <div className="relative flex flex-col gap-2 border-zinc-300 bg-black/80">
                    <XIcon
                      className="absolute right-2 top-2 size-8 cursor-pointer rounded-md hover:scale-110"
                      onClick={() => setInspectedId(null)}
                    />

                    <CodeEditor
                      value={jsx.jsx}
                      language="jsx"
                      onChange={(e) => {
                        setJSXs((prev) =>
                          prev.map((jsx) =>
                            jsx.id === inspectedId
                              ? { ...jsx, jsx: e.target.value }
                              : jsx,
                          ),
                        );
                      }}
                    />
                    <div className="flex justify-end gap-2 p-2">
                      {copySuccess ? (
                        <CopyCheckIcon
                          className={`size-8 scale-110 cursor-none rounded-md text-green-300 transition-all duration-500`}
                        />
                      ) : (
                        <CopyIcon
                          className="size-8 cursor-pointer rounded-md text-white transition-all duration-500 hover:scale-110"
                          onClick={async () => {
                            await navigator.clipboard.writeText(jsx.jsx);
                            setCopySuccess(true);
                            setTimeout(() => setCopySuccess(false), 1000);
                          }}
                        />
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
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
        </div>
      )}
    </div>
  );
}
