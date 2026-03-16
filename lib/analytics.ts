export const analyticsEvents = {
  pageView: 'page_view',
  searchSubmitted: 'search_submitted',
  gameSaved: 'game_saved',
  pricingViewed: 'pricing_viewed',
  checkoutStarted: 'checkout_started',
  checkoutCompleted: 'checkout_completed',
  loginRequested: 'login_requested',
  portalOpened: 'billing_portal_opened'
} as const;

export type AnalyticsEventName = (typeof analyticsEvents)[keyof typeof analyticsEvents];

export function analyticsSnippet(measurementId?: string) {
  if (!measurementId) return '';
  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
}
