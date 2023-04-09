import { useState } from 'react'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import { marketplaceAddress } from '../config'
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
const ipfsClient = require("ipfs-http-client")
const projectId = "2NYjqUJFqJM4q7GFHYhEqoOAlwZ"
const projectSecret = "abc070a0feef9a7fed1945ff0d28497b"
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ name: '', description: '', tag: '', penname: '', collection: '', price: '' })
  const router = useRouter()

  async function onChange(e) {
    const file = e.target.files[0]
    try {
      const client = await ipfsClient.create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        apiPath: '/api/v0',
        headers: {
          authorization: auth
        }
      })
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function uploadToIPFS() {
    const { name, description, tag, penname, collection, price } = formInput;
    if (!name || !description || !tag || !penname || !collection || !price || !fileUrl) return
    /* first, upload to IPFS */
    try {
      const client = await ipfsClient.create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        apiPath: '/api/v0',
        headers: {
          authorization: auth
        }
      })
      const data = JSON.stringify({
        name,
        description,
        tag,
        penname,
        collection,
        price,
        image: fileUrl,
      });
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      /* after file is uploaded to IPFS, return the URL to use it in the transaction */
      return url
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function listNFTForSale() {
    const url = await uploadToIPFS()
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()


    
    /* next, create the item */
    const price = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()
    let transaction = await contract.createToken(url, price, { value: listingPrice })
    await transaction.wait()
   
    router.push('/')
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <p className="mt-4 font-bold">Asset Name</p>
        <input
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <p className="mt-4 font-bold">Asset Description</p>
        <textarea
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <p className="mt-4 font-bold">Asset Tag</p>
        <input
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, tag: e.target.value })}
        />
        <p className="mt-4 font-bold">Asset Penname</p>
        <input
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, penname: e.target.value })}
        />
        <p className="mt-4 font-bold">Asset Collection</p>
        <input
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, collection: e.target.value })}
        />
        <p className="mt-4 font-bold">Asset Price </p>
        <input
          placeholder="LCOIN"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value  })}
        />

        <input
          type="file"
          name="Asset"
          className="my-4"
          onChange={onChange}
        />
        {
          fileUrl && (
            <image className="rounded mt-4" width="350" src={fileUrl} />
          )
        }
        <button onClick={listNFTForSale} className="font-bold mt-4 bg-gray-300 text-black rounded p-4 shadow-lg">
          Create NFT
        </button>
      </div>
    </div>
  )
}