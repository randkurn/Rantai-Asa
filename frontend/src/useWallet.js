import {useState,useCallback} from "react";import {BrowserProvider} from "ethers";
const CHAIN_ID=Number(import.meta.env.VITE_CHAIN_ID||80002);
export function useWallet(){
 const [address,setAddress]=useState(null);const [error,setError]=useState(null);
 const connect=useCallback(async()=>{setError(null);
  if(!window.ethereum)return setError("MetaMask tidak ditemukan");
  try{const p=new BrowserProvider(window.ethereum);await p.send("eth_requestAccounts",[]);
   const n=await p.getNetwork();
   if(Number(n.chainId)!==CHAIN_ID){try{await window.ethereum.request({method:"wallet_switchEthereumChain",params:[{chainId:"0x"+CHAIN_ID.toString(16)}]});}catch{return setError("Pindah ke jaringan testnet yang benar");}}
   setAddress((await (await new BrowserProvider(window.ethereum).getSigner()).getAddress()));}
  catch(e){setError(e.shortMessage||e.message);}},[]);
 return {address,error,connect};
}
