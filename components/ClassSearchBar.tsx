'use client';

type ClassSearchBarProps = {
  value: string;
  suggestions: string[];
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export default function ClassSearchBar({ value, suggestions, onChange, onSubmit }: ClassSearchBarProps) {
  return (
    <div className="mx-auto max-w-xl rounded-lg  bg-[#535350] p-1.5 shadow-lg">
      <label htmlFor="class-search" className="sr-only">
        Search campus courses
      </label>
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <input
            id="class-search"
            list="class-search-suggestions"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onSubmit();
            }}
            placeholder="Search by course name..."
            className="h-11 w-full rounded-md border border-cyan-300/60 bg-black/20 px-3 text-lg text-white  transition placeholder:text-white/50 "
          />
          <datalist id="class-search-suggestions">
            {suggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </div>
        <button
          type="button"
          onClick={onSubmit}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-500"
        >
          Search
        </button>
      </div>
    </div>
  );
}
