import { useTranslation } from 'react-i18next';

/**
 * Footer disclaimer for public articles.
 *
 * This component:
 * - Displays at the bottom of articles
 * - Shows full disclaimer text
 * - Supports EN/ES translations
 * - Uses semantic HTML footer element
 */
export default function DisclaimerFooter() {
  const { t } = useTranslation();

  return (
    <footer className="mt-12 bg-gray-100 border-t-2 border-gray-300 px-6 py-8">
      <div className="container mx-auto max-w-4xl">
        <h3 className="text-xl font-bold text-gray-800 mb-3">
          {t('disclaimer.footer.title')}
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {t('disclaimer.footer.content')}
        </p>
      </div>
    </footer>
  );
}
