import * as React from "react"
import { cn } from "@/utils"
import { ChevronDown } from "lucide-react"

interface SelectContextValue {
    value?: string
    onValueChange?: (value: string) => void
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const SelectContext = React.createContext < SelectContextValue > ({})

const Select = React.forwardRef <
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        value ?: string
    onValueChange?: (value: string) => void
  }
>(({value, onValueChange, children, ...props }, ref) => {
  const [open, setOpen] = React.useState(false)

        return (
        <SelectContext.Provider value={{ value, onValueChange, open, onOpenChange: setOpen }}>
            <div ref={ref} {...props}>
                {children}
            </div>
        </SelectContext.Provider>
        )
})
        Select.displayName = "Select"

        const SelectTrigger = React.forwardRef<
            HTMLButtonElement,
        React.ButtonHTMLAttributes<HTMLButtonElement>
>(({className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)

            return (
            <button
                type="button"
                role="combobox"
                aria-expanded={context.open ? "true" : "false"}
                aria-controls="select-content"
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                onClick={() => context.onOpenChange?.(!context.open)}
                ref={ref}
                {...props}
            >
                {children}
                <ChevronDown className="h-4 w-4 opacity-50" />
            </button>
            )
})
            SelectTrigger.displayName = "SelectTrigger"

            const SelectValue = React.forwardRef<
                HTMLSpanElement,
            React.HTMLAttributes<HTMLSpanElement> & {
                placeholder ?: string
            }
>(({className, placeholder, ...props }, ref) => {
  const context = React.useContext(SelectContext)

                return (
                <span ref={ref} className={cn(className)} {...props}>
                    {context.value || placeholder}
                </span>
                )
})
                SelectValue.displayName = "SelectValue"

                const SelectContent = React.forwardRef<
                    HTMLDivElement,
                React.HTMLAttributes<HTMLDivElement>
>(({className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)

                    if (!context.open) return null

                    return (
                    <div
                        ref={ref}
                        className={cn(
                            "relative z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
                            className
                        )}
                        {...props}
                    >
                        {children}
                    </div>
                    )
})
                    SelectContent.displayName = "SelectContent"

                    const SelectItem = React.forwardRef<
                        HTMLDivElement,
                    React.HTMLAttributes<HTMLDivElement> & {
                        value: string
  }
>(({className, children, value, ...props }, ref) => {
  const context = React.useContext(SelectContext)

                        return (
                        <div
                            ref={ref}
                            className={cn(
                                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                className
                            )}
                            onClick={() => {
                                context.onValueChange?.(value)
                                context.onOpenChange?.(false)
                            }}
                            {...props}
                        >
                            {children}
                        </div>
                        )
})
                        SelectItem.displayName = "SelectItem"

                        export {Select, SelectTrigger, SelectValue, SelectContent, SelectItem}