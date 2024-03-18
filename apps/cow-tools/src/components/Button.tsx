import cn from "clsx";
import { Children, cloneElement, forwardRef, isValidElement } from "react";

export const PREDEFINED_CLASSES = {
  blue: {
    solid: {
      light: "bg-blue9 text-slate12 hover:bg-blue10 border-blue9",
      medium: "bg-blue4 hover:bg-blue5 hover:text-white border-transparent",
      dark: "bg-blue3 text-slate12 hover:bg-blue4 border-blue3",
    },
    outline: {
      light:
        "bg-transparent text-blue9 border-blue9 hover:bg-blue2 hover:border-blue2",
      medium:
        "bg-transparent text-blue4 border-blue4 hover:bg-blue2 hover:border-blue2",
      dark: "bg-transparent text-blue3 border-blue3 hover:bg-blue2 hover:border-blue2",
    },
  },
  cyan: {
    solid: {
      light: "bg-cyan9 text-slate12 hover:bg-cyan10 border-cyan9",
      medium: "bg-cyan4 text-slate12 hover:bg-cyan5 border-cyan4",
      dark: "bg-cyan3 text-slate12 hover:bg-cyan4 border-cyan3",
    },
    outline: {
      light:
        "bg-transparent text-cyan9 border-cyan9 hover:bg-cyan2 hover:border-cyan2",
      medium:
        "bg-transparent text-cyan4 border-cyan4 hover:bg-cyan2 hover:border-cyan2",
      dark: "bg-transparent text-cyan3 border-cyan3 hover:bg-cyan2 hover:border-cyan2",
    },
  },
  amber: {
    solid: {
      light: "bg-amber9 text-slate12 hover:bg-amber10 border-amber9",
      medium: "bg-amber4 text-slate12 hover:bg-amber5 border-amber4",
      dark: "bg-amber3 text-slate12 hover:bg-amber4 border-amber3",
    },
    outline: {
      light:
        "bg-transparent text-amber10 border-amber9 hover:bg-amber2 hover:border-amber2",
      medium:
        "bg-transparent text-amber5 border-amber4 hover:bg-amber2 hover:border-amber2",
      dark: "bg-transparent text-amber10 border-amber3 hover:bg-amber2 hover:border-amber2",
    },
    "lighter-outline": {
      light: "bg-transparent text-amber9 border-amber9",
      medium: "bg-transparent text-amber4 border-amber4",
      dark: "bg-transparent text-amber3 border-amber3",
    },
    ghost: {
      light: "hover:bg-accent hover:text-accent-foreground",
      medium: "hover:bg-accent hover:text-accent-foreground",
      dark: "hover:bg-accent hover:text-accent-foreground",
    },
  },
  slate: {
    solid: {
      light: "bg-slate9 text-slate12 hover:bg-slate10 border-slate9",
      medium: "bg-slate4 text-slate12 hover:bg-slate5 border-slate4",
      dark: "bg-slate3 text-slate12 hover:bg-slate4 border-slate3",
    },
    outline: {
      light:
        "bg-transparent text-slate9 border-slate9 hover:bg-slate2 hover:border-slate2",
      medium:
        "bg-transparent text-slate4 border-slate4 hover:bg-slate2 hover:border-slate2",
      dark: "bg-transparent text-slate3 border-slate3 hover:bg-slate2 hover:border-slate2",
    },
    ghost: {
      light: "hover:bg-accent hover:text-accent-foreground",
      medium: "hover:bg-accent hover:text-accent-foreground",
      dark: "hover:bg-accent hover:text-accent-foreground",
    },
  },
} as const;

type ButtonColor = keyof typeof PREDEFINED_CLASSES;
type ButtonVariant = keyof typeof PREDEFINED_CLASSES.blue;
type ButtonShade = keyof typeof PREDEFINED_CLASSES.blue.solid;

export interface ButtonProps
  extends React.PropsWithChildren<
    React.ButtonHTMLAttributes<HTMLButtonElement>
  > {
  color?: ButtonColor;
  variant?: ButtonVariant;
  shade?: ButtonShade;
  className?: string;
}

const Button = forwardRef(function (
  {
    className = "",
    children,
    color = "blue",
    variant = "solid",
    shade = "light",
    disabled = false,
    ...rest
  }: ButtonProps,
  ref: React.Ref<HTMLButtonElement>,
) {
  const childrenArray = Children.toArray(children);
  const hasIconLeft =
    isValidElement(childrenArray[0]) && childrenArray[0].type === ButtonIcon;

  const modifiedChildren = childrenArray.map((child) => {
    if (isValidElement(child) && child.type === ButtonIcon) {
      const positionClass = hasIconLeft ? "mr-2" : "ml-2";

      return cloneElement(child, {
        // @ts-ignore
        className: positionClass,
      });
    }
    return child;
  });

  const buttonClasses = PREDEFINED_CLASSES[color][variant][shade];

  return (
    <button
      ref={ref}
      {...rest}
      disabled={disabled}
      className={cn(
        className,
        buttonClasses,
        "rounded-md text-center text-sm font-semibold border focus-visible:outline-blue7 focus-visible:outline-offset-2 disabled:opacity-40",
        /px-|py-|p-/.test(className) ? "" : "py-3 px-5",
      )}
    >
      {modifiedChildren}
    </button>
  );
});

export function ButtonIcon({
  icon,
  className,
}: {
  icon: React.ReactNode;
  className?: string;
}) {
  return <span className={className}>{icon}</span>;
}

export default Button;
