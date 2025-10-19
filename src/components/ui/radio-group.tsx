import * as React from "react"
import { cn } from "@/utils"

interface RadioGroupContextValue {
    value?: string
    onValueChange?: (value: string) => void
    name?: string
}

const RadioGroupContext = React.createContext < RadioGroupContextValue > ({})

const RadioGroup = React.forwardRef <
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        value ?: string
    onValueChange?: (value: string) => void
        name?: string
  }
>(({className, value, onValueChange, name, ...props }, ref) => (
        <RadioGroupContext.Provider value={{ value, onValueChange, name }}>
            <div
                className={cn("grid gap-2", className)}
                role="radiogroup"
                ref={ref}
                {...props}
            />
        </RadioGroupContext.Provider>
        ))
        RadioGroup.displayName = "RadioGroup"

        const RadioGroupItem = React.forwardRef<
            HTMLInputElement,
        React.InputHTMLAttributes<HTMLInputElement>
>(({className, ...props }, ref) => {
  const context = React.useContext(RadioGroupContext)

            return (
            <input
                type="radio"
                className={cn(
                    "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                name={context.name}
                checked={context.value === props.value}
                onChange={(e) => {
                    if (e.target.checked && context.onValueChange) {
                        context.onValueChange(props.value as string)
                    }
                }}
                {...props}
            />
            )
})
            RadioGroupItem.displayName = "RadioGroupItem"

            export {RadioGroup, RadioGroupItem}