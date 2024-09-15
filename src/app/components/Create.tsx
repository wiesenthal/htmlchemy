import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { schema } from "~/app/api/generate/schema";
import { LoaderCircle } from "lucide-react";
import { type JSX } from "~/app/main";

const createJSXSchema = z.object({
  prompt: z.string(),
});

type FormData = z.infer<typeof createJSXSchema>;

export function Create({
  selectedJSXs,
  setJSXs,
}: {
  selectedJSXs: JSX[];
  setJSXs: React.Dispatch<React.SetStateAction<JSX[]>>;
}) {
  const { register, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(createJSXSchema),
  });

  const { isLoading, submit } = useObject({
    schema: schema,
    api: "/api/generate",
    onFinish: async ({ object }) => {
      if (!object) return;
      const newJSX = {
        ...object,
        id: Math.floor(Math.random() * 1000000),
      };
      setJSXs((prev) => [...prev, newJSX]);
    },
  });

  const onSubmit = ({ prompt }: FormData) => {
    reset();
    submit({
      prompt:
        selectedJSXs.length === 0
          ? `Generate valid, complete JSX for an element to satisfy the user's whim (JSX, you don't have to render it): ${prompt}`
          : `Generate the next JSX in the sequence: ${selectedJSXs
              .map((JSX, i) => `v${i}: jsx=\`${JSX.jsx}\``)
              .join("\n")}

Satisfy the user's whim: ${prompt}`,
    });
  };

  return (
    <div className="z-20 flex flex-row items-center gap-2">
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          disabled={isLoading}
          {...register("prompt")}
          placeholder={
            isLoading
              ? "Generating..."
              : selectedJSXs.length === 0
                ? "What do you want?"
                : "How do you want it to change?"
          }
          className="rounded-lg border-2 border-zinc-200 p-1 text-black min-w-[300px] md:min-w-[500px]"
          autoComplete="off"
        />
      </form>
      {isLoading && <LoaderCircle className="animate-spin" />}
    </div>
  );
}
