import cn from "clsx";

enum SpinnerSize {
  sm = 6,
  md = 12,
  lg = 20,
}
export function Spinner({ size = "md" }: { size?: keyof typeof SpinnerSize }) {
  const SpinnerSizeNumber = SpinnerSize[size];
  return (
    <div
      className={cn("flex w-full flex-col items-center rounded-3xl", {
        "px-12 py-16 md:py-20": SpinnerSizeNumber === SpinnerSize.md,
      })}
    >
      <div
        className={cn(
          "border-6 mx-2 animate-spin rounded-full border-2 border-solid border-l-primary border-foreground",
          {
            "h-4 w-4": SpinnerSizeNumber === SpinnerSize.sm,
            "h-12 w-12": SpinnerSizeNumber === SpinnerSize.md,
            "h-20 w-20": SpinnerSizeNumber === SpinnerSize.lg,
          },
        )}
      />
    </div>
  );
}
