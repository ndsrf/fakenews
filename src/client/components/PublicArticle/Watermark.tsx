/**
 * Semi-transparent "FICTIONAL" watermark overlay.
 *
 * This component:
 * - Displays diagonal "FICTIONAL" text across the page
 * - Uses 3% opacity to be visible but not intrusive
 * - Rotated -45 degrees
 * - Fixed positioning with pointer-events-none
 */
export default function Watermark() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="text-gray-400 text-8xl md:text-9xl font-bold whitespace-nowrap opacity-[0.03] rotate-[-45deg] select-none"
        >
          FICTIONAL
        </div>
      </div>
    </div>
  );
}
