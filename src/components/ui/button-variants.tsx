import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:shadow-[0_0_20px_hsl(var(--primary-glow)/0.5)] hover:scale-105",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:shadow-[0_0_20px_hsl(var(--secondary)/0.3)] hover:scale-105",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-lg hover:shadow-[0_0_30px_hsl(var(--primary-glow)/0.6)] hover:scale-105 font-bold text-lg",
        success: "bg-accent text-accent-foreground hover:shadow-[0_0_20px_hsl(var(--accent)/0.4)] hover:scale-105",
      },
      size: {
        default: "h-12 px-6 py-3 min-w-[120px]",
        sm: "h-10 rounded-lg px-4 min-w-[100px]",
        lg: "h-14 rounded-2xl px-8 text-lg min-w-[140px]",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
