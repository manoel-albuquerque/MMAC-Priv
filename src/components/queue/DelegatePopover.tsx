"use client";

import { useState } from "react";
import Image from "next/image";
import { UserPlus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppState } from "@/state/AppStateContext";
import { useUiFocus } from "@/hooks/useUiFocus";
import { teamRoster, type TeamMember } from "@/data/team";

function Avatar({ member, size = 7 }: { member: TeamMember; size?: 7 | 9 | 10 }) {
  const px = size === 10 ? 40 : size === 9 ? 36 : 28;
  const cls =
    size === 10 ? "size-10" : size === 9 ? "size-9" : "size-7";
  return (
    <span
      className={cn(
        "relative inline-block shrink-0 overflow-hidden rounded-full bg-neutral-200 ring-1 ring-inset ring-neutral-200",
        cls,
      )}
      aria-hidden
    >
      <Image
        src={member.photoUrl}
        alt={member.name}
        width={px}
        height={px}
        className="size-full object-cover"
      />
    </span>
  );
}

type DelegatePopoverProps = {
  itemId: string;
  // Trigger: render-prop so the caller controls the button styling.
  children?: React.ReactNode;
  // Called once the user picks someone — parent can close menus, etc.
  onDelegated?: () => void;
};

export function DelegatePopover({
  itemId,
  children,
  onDelegated,
}: DelegatePopoverProps) {
  const { delegateItem } = useAppState();
  const [open, setOpen] = useState(false);
  useUiFocus(open);

  const handlePick = (teamMemberId: string) => {
    delegateItem(itemId, teamMemberId);
    setOpen(false);
    onDelegated?.();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children ?? (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-3 text-[11px]"
            onClick={(e) => e.stopPropagation()}
          >
            <UserPlus className="mr-1 size-3" /> Delegate
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-64 p-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          Delegate to
        </div>
        <ul className="flex flex-col">
          {teamRoster.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => handlePick(m.id)}
                className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left transition-colors hover:bg-neutral-100"
              >
                <Avatar member={m} size={9} />
                <div className="flex min-w-0 flex-col">
                  <span className="text-[12px] font-medium text-neutral-900">
                    {m.name}
                  </span>
                  <span className="text-[10.5px] text-neutral-500">
                    {m.role}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

// Exposed so rows showing a delegated state can render the avatar next to
// the assignee's name without a second trip to the roster.
export function DelegatedAvatar({
  teamMemberId,
  size = 7,
}: {
  teamMemberId: string;
  size?: 7 | 9;
}) {
  const member = teamRoster.find((m) => m.id === teamMemberId);
  if (!member) return null;
  return <Avatar member={member} size={size} />;
}
