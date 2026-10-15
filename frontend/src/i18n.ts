import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';

const locales = ['ja', 'en', 'ko'];

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  if (!locale || !locales.includes(locale)) {
    locale = 'ja';
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
