import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import axios from 'axios'
import Image from 'next/image'
import Web3Modal from 'web3modal'


import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function ResellNFT() {
  const [formInput, updateFormInput] = useState({ price: '', image: '', description: '', tag: '', penname: '', collection: '' })
  const router = useRouter()
  const { id, tokenURI } = router.query
  const { image, name, price, description, tag, penname, collection } = formInput

  async function fetchNFT() {
    if (!tokenURI) return
    const meta = await axios.get(tokenURI)
    updateFormInput((state) => ({
      ...state,
      image: meta.data.image,
      name: meta.data.name,
      description: meta.data.description,
      tag: meta.data.tag,
      penname: meta.data.penname,
      collection: meta.data,
    }))
  }

  useEffect(() => {
    fetchNFT()
  }, [id, tokenURI])

  async function listNFTForSale() {
    if (!price) return
    
    const connection = await Web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const priceFormatted = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()

    listingPrice = listingPrice.toString()
    let transaction = await contract.resellToken(id, priceFormatted, { value: listingPrice })
    await transaction.wait()

    router.push('/')
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={(e) => updateFormInput({ ...formInput, price: e.target.value })}
        />
        {image && (
          <Image
            className="rounded mt-4"
            width="350"
            src={image}
            alt={`Image of ${name}`}
          />
        )}
        <p className="text-4xl font-bold text-white">{name}</p>
        <p className="text-2xl font-bold text-white">Description: {description} </p>
        <p className="text-2xl font-bold text-white">Tag: {tag}</p>
        <p className="text-2xl font-bold text-white">Penname: {penname} </p>
        <p className="text-2xl font-bold text-white">Collection: {collection} </p>
        <button onClick={listNFTForSale} className="font-bold mt-4 bg-black-500 text-white rounded p-4 shadow-lg">
                List NFT
        </button>
            </div>
          </div>
        )
            }