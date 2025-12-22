import React from 'react';

interface AccountStatsProps {
  joinedAt?: string;
  totalReviews: number;
}

export default function AccountStats({ joinedAt, totalReviews }: AccountStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Joined At */}
      <div className="bg-black/40 rounded-xl p-5 border border-white/5">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Joined At</p>
        <p className="text-lg text-white font-medium">
          {joinedAt ? new Date(joinedAt).toLocaleDateString() : 'N/A'}
        </p>
      </div>
      {/* Total Reviews */}
      <div className="bg-black/40 rounded-xl p-5 border border-white/5">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Total Reviews</p>
        <p className="text-lg text-white font-medium">
          {totalReviews}
        </p>
      </div>
    </div>
  );
}