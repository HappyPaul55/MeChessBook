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
                    href="http://fonts.googleapis.com/css?family=Roboto:400,100,100italic,300,300italic,400italic,500,500italic,700,700italic,900italic,900"
                    rel="stylesheet"
                    type="text/css"
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <body className="bg-gray-200 print:bg-none ">
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}