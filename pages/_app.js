/* pages/_app.js */
import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-6">
        <p className="text-4xl font-bold">L-NFT Marketplace</p>
        <div className="flex mt-4">
        <Link href="/" passHref legacyBehavior>
            <a className="mr-4 text-black-500">
              Home
            </a>
        </Link>
        <Link href="/create-nft" passHref legacyBehavior>
            <a className="mr-6 text-black-500">
              Sell NFT
            </a>
        </Link>
        <Link href="/my-nfts" passHref legacyBehavior>
            <a className="mr-6 text-black-500">
              My NFTs
            </a>
        </Link>
        <Link href="/dashboard" passHref legacyBehavior>
            <a className="mr-6 text-black-500">
              Dashboard
            </a>
        </Link>

        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
