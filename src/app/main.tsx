"use client";

import { type Agent } from "~/server/db/types";
import { api } from "~/trpc/react";
import { Button } from "./components/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { XIcon } from "lucide-react";

export function MainContent() {
  const { data: agents, isLoading } = api.agent.getAll.useQuery();
  return (
    <div className="flex flex-col items-center gap-4">
      {isLoading ? (
        <div>Loading...</div>
      ) : agents && agents.length > 0 ? (
        <Agents agents={agents} />
      ) : (
        <div>No agents found</div>
      )}
      <CreateAgent />
    </div>
  );
}

function Agents({ agents }: { agents: Agent[] }) {
  return (
    <div className="flex flex-row flex-wrap gap-4">
      {agents.map((agent) => (
        <Agent key={agent.id} agent={agent} />
      ))}
    </div>
  );
}

function Agent({ agent }: { agent: Agent }) {
  const { sinceNow } = useNow();
  const { mutateAsync: deleteAgent } = api.agent.delete.useMutation();
  const invalidate = api.useUtils().agent.getAll.invalidate;
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMe = async () => {
    setIsDeleting(true);
    await deleteAgent(agent.id);
    await invalidate();
    setIsDeleting(false);
  };

  return (
    <div key={agent.id} className="flex flex-col gap-2 bg-white/10 p-1">
      <Button
        disabled={isDeleting}
        className="rounded-sm from-slate-50 to-zinc-200"
      >
        {agent.prompt}
      </Button>
      <div className="flex flex-row items-center justify-between">
        <div className="text-sm text-gray-300">{sinceNow(agent.createdAt)}</div>
        <Button
          disabled={isDeleting}
          onClick={deleteMe}
          className="flex size-5 items-center justify-center rounded-sm from-red-200 to-red-300 px-0 py-0 text-center text-xs text-red-900"
        >
          <XIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}

const useNow = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const sinceNow = (date: Date, pretty = true) => {
    const diff = now.getTime() - date.getTime();
    if (diff < 0) {
      return "just now";
    }
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (pretty) {
      return (
        `${days ? `${days}d ` : ""}${hours % 24 ? `${hours % 24}h ` : ""}${minutes % 60 ? `${minutes % 60}m ` : ""}${seconds % 60 ? `${seconds % 60}s` : ""}`.trim() ||
        "just now"
      );
    }
    return seconds;
  };
  return { now, sinceNow };
};

const CreateAgentSchema = z.object({
  prompt: z.string().min(1),
});

function CreateAgent() {
  const { mutateAsync: createAgent } = api.agent.create.useMutation();
  const invalidate = api.useUtils().agent.getAll.invalidate;

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid, isLoading, isSubmitting },
  } = useForm<z.infer<typeof CreateAgentSchema>>({
    defaultValues: {
      prompt: "",
    },
    resolver: zodResolver(CreateAgentSchema),
  });

  const onSubmit = async (data: { prompt: string }) => {
    reset();
    await createAgent(data);
    await invalidate();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-row items-center gap-4"
    >
      <Button type="submit" disabled={!isValid || isLoading || isSubmitting}>
        {isLoading ? "Creating..." : "Create Agent"}
      </Button>
      <input
        {...register("prompt")}
        type="text"
        placeholder="prompt..."
        className="rounded-sm border border-gray-300 p-2 text-black"
        disabled={isLoading || isSubmitting}
      />
    </form>
  );
}
