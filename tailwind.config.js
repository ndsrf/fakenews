/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/client/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Merriweather', 'Times New Roman', 'Times', 'serif'],
        sans: ['Inter', 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.900'),
            fontSize: '1.125rem',
            lineHeight: '1.75',
            fontFamily: theme('fontFamily.serif').join(', '),
            h1: {
              color: theme('colors.gray.900'),
              fontFamily: theme('fontFamily.sans').join(', '),
              fontWeight: '700',
            },
            h2: {
              color: theme('colors.gray.900'),
              fontFamily: theme('fontFamily.sans').join(', '),
              fontWeight: '700',
            },
            h3: {
              color: theme('colors.gray.900'),
              fontFamily: theme('fontFamily.sans').join(', '),
              fontWeight: '600',
            },
            h4: {
              color: theme('colors.gray.900'),
              fontFamily: theme('fontFamily.sans').join(', '),
              fontWeight: '600',
            },
            blockquote: {
              fontStyle: 'italic',
              fontSize: '1.25rem',
              borderLeftWidth: '4px',
              borderLeftColor: theme('colors.gray.700'),
              paddingLeft: '1.5rem',
            },
            a: {
              color: theme('colors.blue.600'),
              textDecoration: 'underline',
              '&:hover': {
                color: theme('colors.blue.800'),
              },
            },
            strong: {
              fontWeight: '700',
            },
            figcaption: {
              fontSize: '0.875rem',
              fontStyle: 'italic',
              color: theme('colors.gray.600'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
