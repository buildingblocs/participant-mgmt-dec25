import * as Sentry from "@sentry/sveltekit";

Sentry.init({
  dsn: "https://a60a02d5d402afc617f5e1c0994f15fb@o4510464603324416.ingest.de.sentry.io/4510464604766288",

  tracesSampleRate: 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  enabled: process.env.NODE_ENV === "production",

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: import.meta.env.DEV,
});
