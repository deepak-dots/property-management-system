import '../styles/globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import App from 'next/app';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

// Add getInitialProps safely
MyApp.getInitialProps = async (appContext) => {
  // Get initial props of App (to preserve Next.js behavior)
  const appProps = await App.getInitialProps(appContext);

  let pageProps = {};

  // Call page's getInitialProps if it exists
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  }

  return { ...appProps, pageProps };
};

export default MyApp;
