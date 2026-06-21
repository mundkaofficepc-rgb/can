"use client";

import { toast } from "sonner";
import { Button } from "./button";
import { Toaster } from "./sonner";

export default function ToasterDemo() {
  return (
    <div className="flex flex-col gap-2 p-4 bg-zinc-900/50 rounded-xl border border-white/5">
      <Toaster />
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() =>
            toast("Event has been created", {
              description: "Sunday, December 03, 2023 at 9:00 AM",
              action: {
                label: "Undo",
                onClick: () => console.log("Undo"),
              },
            })
          }
        >
          Default Toast
        </Button>

        <Button
          variant="secondary"
          onClick={() =>
            toast.success("Success!", {
              description: "Your action was completed successfully",
            })
          }
        >
          Success Toast
        </Button>

        <Button
          variant="destructive"
          onClick={() =>
            toast.error("Error!", {
              description: "Something went wrong. Please try again.",
            })
          }
        >
          Error Toast
        </Button>

        <Button
          variant="ghost"
          onClick={() =>
            toast.promise(
              new Promise((resolve) => setTimeout(resolve, 2000)),
              {
                loading: "Loading...",
                success: "Promise resolved",
                error: "Promise rejected",
              }
            )
          }
        >
          Promise Toast
        </Button>
      </div>
    </div>
  );
}

export { ToasterDemo };
