
import * as React from "react"

const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={className}
    {...props}>
    <div className="h-full w-full overflow-auto">
      {children}
    </div>
  </div>
))
ScrollArea.displayName = "ScrollArea"

const ScrollBar = React.forwardRef(({ className, orientation = "vertical", ...props }, ref) => (
  <div
    ref={ref}
    className={`flex touch-none select-none ${orientation === "vertical" ? "h-full w-2.5" : "h-2.5 w-full"} ${className || ""}`}
    {...props}
  />
))
ScrollBar.displayName = "ScrollBar"

export { ScrollArea, ScrollBar }

// Adicionar exportação padrão
export default ScrollArea
