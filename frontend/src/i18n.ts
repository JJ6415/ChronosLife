import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';

const locales = ['ja'];

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  if (!locale || !locales.includes(locale)) {
    locale = 'ja';
  }

  return {
    locale: 'ja',
    messages: (await import(`./messages/ja.json`)).default
  };
});
