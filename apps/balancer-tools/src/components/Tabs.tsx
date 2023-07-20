import * as TabsPrimitive from "@radix-ui/react-tabs";
import cn from "clsx";
import { createContext, useContext } from "react";

const TabContext = createContext({});

function useTabContext() {
  const context = useContext(TabContext);

  if (!context) {
    throw new Error(
      "Child components of Tab cannot be rendered outside the Tab component!",
    );
  }

  return context;
}

export function Tabs({
  children,
  defaultValue,
  value,
}: React.PropsWithChildren<{ defaultValue: string; value?: string }>) {
  return (
    <TabContext.Provider value={{}}>
      <TabsPrimitive.Root
        className="flex h-full w-full flex-col bg-blue2 text-slate8"
        value={value}
        defaultValue={defaultValue}
      >
        <TabsPrimitive.List className="flex shrink-0 flex-col border-b border-blue1 bg-blue3">
          {children}
        </TabsPrimitive.List>
      </TabsPrimitive.Root>
    </TabContext.Provider>
  );
}

function TabItemTriggerWrapper({ children }: React.PropsWithChildren) {
  return <div className="flex flex-1">{children}</div>;
}

function TabItemTrigger({
  children,
  tabName,
  color,
  onClick,
}: React.PropsWithChildren<{
  tabName: string;
  color?: string;
  onClick?: (event: React.FormEvent<HTMLButtonElement>) => void;
}>) {
  useTabContext();
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "px-5 h-[45px] flex-1 flex items-center justify-center text-[15px] hover:text-white hover:bg-blue4 data-[state=active]:text-white outline-none cursor-defaul} data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0]",
      )}
      value={tabName}
      onClick={onClick}
    >
      <div className="flex items-center justify-center gap-x-3">
        {color && <div className={cn(`w-3 h-3 rounded-full bg-${color}`)} />}
        {children}
      </div>
    </TabsPrimitive.Trigger>
  );
}

function TabItemContent({
  children,
  tabName,
  bgColor = "bg-blue2",
}: React.PropsWithChildren<{ tabName: string; bgColor?: `bg-${string}` }>) {
  useTabContext();
  return (
    <TabsPrimitive.Content
      className={`${bgColor} grow py-5 outline-none`}
      value={tabName}
    >
      {children}
    </TabsPrimitive.Content>
  );
}
Tabs.ItemTriggerWrapper = TabItemTriggerWrapper;
Tabs.ItemTrigger = TabItemTrigger;
Tabs.ItemContent = TabItemContent;