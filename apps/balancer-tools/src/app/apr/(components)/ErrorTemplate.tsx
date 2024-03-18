"use client";

import Link from "next/link";

import BreadcrumbSkeleton from "./(skeleton)/BreadcrumbSkeleton";
import ChartSkelton from "./(skeleton)/ChartSkelton";
import KpisSkeleton from "./(skeleton)/KpisSkeleton";
import TableSkeleton from "./(skeleton)/TableSkeleton";

export default function ErrorTemplate({
  title,
  textContent,
}: {
  title: string;
  textContent: string;
}) {
  return (
    <div className="flex flex-1 size-full flex-col justify-start rounded-3xl text-white gap-y-3">
      <BreadcrumbSkeleton />
      <KpisSkeleton />
      <ChartSkelton />
      <TableSkeleton />

      <div
        id="medium-modal"
        tabIndex={-1}
        className="fixed top-0 inset-x-0 z-50 h-screen sm:h-full w-full p-4 overflow-hidden md:inset-0 sm:max-h-full bg-black/60 flex justify-center items-center"
      >
        <div className="relative w-full max-w-lg max-h-full">
          <div className="relative border border-blue6 bg-blue3 rounded-lg">
            <div className="flex items-center justify-between p-5 border-b rounded-t border-blue6">
              <h3 className="text-xl font-medium text-white">{title}</h3>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-base leading-relaxed text-gray-400 break-all">
                {textContent}
              </p>
            </div>
            <div className="flex items-center p-6 space-x-2 border-t border-blue6 rounded-b">
              <Link
                href={"/apr"}
                data-modal-hide="medium-modal"
                type="button"
                className="text-white bg-blue4 border border-blue6 hover:bg-blue3 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-blue-800"
              >
                Go to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
