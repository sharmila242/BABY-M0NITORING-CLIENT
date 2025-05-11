import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          error: 
            "group-[.toaster]:border-red-500 group-[.toaster]:bg-red-50 group-[.toaster]:text-red-900 group-[.toaster]:shadow-red-100",
          icon: 
            "group-[.error]:text-red-500",
        },
      }}
      icons={{
        error: () => (
          <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
            !
          </div>
        ),
      }}
      position="top-right"
      duration={6000}
      closeButton
      {...props}
    />
  )
}

export { Toaster }
