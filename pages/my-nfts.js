import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { create } from 'ipfs-http-client'

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
const projectId = "2NYjqUJFqJM4q7GFHYhEqoOAlwZ"
const projectSecret = "abc070a0feef9a7fed1945ff0d28497b"
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');



export default function MyAssets() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const router = useRouter()
  const ipfs = create({ 
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    apiPath: '/api/v0',
    headers: {
      authorization: auth
    } })
  
  useEffect(() => {
    loadNFTs()
  }, [])

  async function fetchFromIPFS(cid) {
    try {
      const response = await ipfs.get(cid);
      const data = await response.text();
      return JSON.parse(data);
    } catch (error) {
      console.log('Failed to fetch metadata from IPFS', error)
      return null
    }
  }

  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
  
    const marketplaceContract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    const data = await marketplaceContract.fetchMyNFTs()
  
    const items = await Promise.all(data.map(async i => {
      const tokenURI = await marketplaceContract.tokenURI(i.tokenId)
      const metaCID = tokenURI.replace('ipfs://', '');
      const meta = await fetchFromIPFS(metaCID);
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        name: `https://ipfs.io/ipfs/${meta.name}`,
        description: `https://ipfs.io/ipfs/${meta.description}`,
        tag: `https://ipfs.io/ipfs/${meta.tag}`,
        penname: `https://ipfs.io/ipfs/${meta.penname}`,
        collection: `https://ipfs.io/ipfs/${meta.collection}`,
        image: `https://ipfs.io/ipfs/${meta.image.cid}`,
        tokenURI
      }
  
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }

  function listNFT(nft) {
    console.log('nft:', nft)
    router.push(`/resell-nft?id=${nft.tokenId}&tokenURI=${nft.tokenURI}`)
  }
  
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs owned</h1>)
  return (
    <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <Image src = {nft.image} className="rounded" />
                <div className="p-4 bg-black">
                  <p className="text-4xl font-bold text-white">{nft.name}</p>
                  <p className="text-2xl font-bold text-white">Description: {nft.descriptiion} </p>
                  <p className="text-2xl font-bold text-white">Tag: {nft.tag}</p>
                  <p className="text-2xl font-bold text-white">Penname: {nft.penname} </p>
                  <p className="text-2xl font-bold text-white">Collection: {nft.collection} </p>
                  <p className="text-2xl font-bold text-black">Price - {nft.price} Eth</p>
                  <button className="mt-4 w-full bg-black-500 text-white font-bold py-2 px-12 rounded" onClick={() => listNFT(nft)}>List</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}