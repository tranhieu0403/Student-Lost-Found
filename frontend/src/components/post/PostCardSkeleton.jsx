export default function PostCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200/70 rounded-2xl overflow-hidden shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)]">
      {/* Image — same 16:9 aspect as real card */}
      <div className="aspect-video bg-gray-100 animate-pulse" />

      <div className="p-4 space-y-2">
        {/* 2 fake badges */}
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-5 rounded-full bg-gray-100 animate-pulse" />
          <div className="w-16 h-5 rounded-full bg-gray-100 animate-pulse" />
        </div>

        {/* Title — 2 lines */}
        <div className="space-y-1.5 pt-1">
          <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* Description — 2 lines, smaller */}
        <div className="space-y-1.5 pt-1">
          <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
          <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* Footer — 2 small pills */}
        <div className="pt-3 mt-1 border-t border-gray-100 flex items-center justify-between">
          <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* "Xem chi tiết" placeholder */}
        <div className="pt-1">
          <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
