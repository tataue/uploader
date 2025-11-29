import { Upload } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/25">
        <Upload className="h-5 w-5 text-white" />
      </div>
      <span className="text-xl font-bold tracking-tight text-neutral-900">
        Uploader
      </span>
    </div>
  );
}
