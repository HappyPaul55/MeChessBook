import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html>
            <Head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Anton&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css?family=Roboto:400,100,100italic,300,300italic,400italic,500,500italic,700,700italic,900italic,900"
                    rel="stylesheet"
                    type="text/css"
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
                <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
                <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
                <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
                <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png" />
                <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png" />
                <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png" />
                <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
                <link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="manifest" href="/manifest.json" />
                <meta name="msapplication-TileColor" content="#efefef" />
                <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
                <meta name="theme-color" content="#efefef" />
                <meta name="application-name" content="Me Chess Book" />
                <meta name="generator" content="Super Dooper Book Maker" />
                <meta name="rating" content="General" />
                <meta name="format-detection" content="telephone=no" />
                <link rel="me" href="https://www.linkedin.com/in/happypaul55/" type="text/html" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Me Chess Book" />
                <meta property="og:description" content="Create a Chess Book from your Lichess games" />
                <meta property="og:site_name" content="Me Chess Book" />
                <meta property="og:locale" content="en_GB" />
                <meta property="article:author" content="Paul Happy Hutchinson" />
                <meta http-equiv="x-ua-compatible" content="ie=edge" />
                <meta name="msapplication-config" content="/browserconfig.xml" />
            </Head>
            <body className="bg-gray-200 print:bg-none">
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}