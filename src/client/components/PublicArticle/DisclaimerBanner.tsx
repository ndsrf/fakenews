import { useTranslation } from 'react-i18next';

/**
 * Sticky disclaimer banner for public articles.
 *
 * This component:
 * - Displays at the top of public articles
 * - Remains visible when scrolling (sticky positioning)
 * - Shows warning icon and text
 * - Supports EN/ES translations
 */
export default function DisclaimerBanner() {
  const { t } = useTranslation();

  return (
    <div className="sticky top-0 z-50 bg-yellow-100 border-b-2 border-yellow-400 px-4 py-3 shadow-md">
      <div className="container mx-auto flex items-center justify-center">
        <p className="text-yellow-900 font-semibold text-sm md:text-base text-center">
          {t('disclaimer.banner')}
        </p>
      </div>
    </div>
  );
}
