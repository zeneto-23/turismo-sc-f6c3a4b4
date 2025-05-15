
import * as React from "react"
import { cn } from "@/components/ui/utils"

const Separator = React.forwardRef(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "shrink-0 bg-gray-200",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
      role={decorative ? "none" : "separator"}
      aria-orientation={orientation}
    />
  )
)
Separator.displayName = "Separator"

export { Separator }
