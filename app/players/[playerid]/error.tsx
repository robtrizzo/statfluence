"use client";

import {
  TypographyH3,
  TypographyP,
  TypographyUnorderedList,
} from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="p-8">
      <div className="border border-red-200 rounded-lg p-6 bg-red-50">
        <TypographyH3 className="text-red-800 mb-4">
          Something went wrong!
        </TypographyH3>
        <TypographyP className="text-red-600 mb-4">
          We couldn&apos;t load the player data. This might be due to:
        </TypographyP>
        <TypographyUnorderedList className="text-red-600 mb-4">
          <li>Player not found</li>
          <li>Database connection issue</li>
          <li>Invalid player ID format</li>
        </TypographyUnorderedList>
        <Button
          onClick={reset}
          className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
