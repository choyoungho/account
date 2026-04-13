'use client';

interface DateNavProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
}

export default function DateNav({ label, onPrev, onNext }: DateNavProps) {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 mb-4 shadow-sm">
      <button
        onClick={onPrev}
        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
      >
        ◀
      </button>
      <span className="font-bold text-gray-700">{label}</span>
      <button
        onClick={onNext}
        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
      >
        ▶
      </button>
    </div>
  );
}
