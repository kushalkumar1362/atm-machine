const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry); // Cumulative Layout Shift (CLS)
      getFID(onPerfEntry); // First Input Delay (FID)
      getFCP(onPerfEntry); // First Contentful Paint (FCP)
      getLCP(onPerfEntry); // Largest Contentful Paint (LCP)
      getTTFB(onPerfEntry); // Time to First Byte (TTFB)
    });
  }
};

export default reportWebVitals;
