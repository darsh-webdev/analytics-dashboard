import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface MultiSelectProps<T extends string = string> {
  options: readonly T[] | T[];
  selected: T[];
  onChange: (selected: T[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleToggle = (option: string) => {
    if (option === "All") {
      onChange(["All"]);
    } else {
      const filtered = selected.filter((o) => o !== "All");
      if (filtered.includes(option)) {
        const updated = filtered.filter((o) => o !== option);
        onChange(updated.length === 0 ? ["All"] : updated);
      } else {
        onChange([...filtered, option]);
      }
    }
  };

  const displayText = selected.includes("All")
    ? "All OTAs"
    : selected.length === 0
    ? placeholder
    : `${selected.length} OTA${selected.length > 1 ? "s" : ""} selected`;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {displayText}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="w-[200px] p-0 bg-white border rounded-md shadow-md z-50"
          align="start"
        >
          <div className="max-h-[300px] overflow-y-auto p-1">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent rounded-sm transition-colors"
              >
                <Checkbox
                  checked={selected.includes(option)}
                  onCheckedChange={() => handleToggle(option)}
                />
                <span className="text-sm flex-1">{option}</span>
              </label>
            ))}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
