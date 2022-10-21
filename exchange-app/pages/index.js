import { BigNumber, providers, utils } from 'ethers';
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'
import { addLiquidity, calculateCM } from '../utils/addLiquidity';
import { getCMTokensBalance, getEtherBalance, getLPTokenBalance, getReserveOfCMToken } from '../utils/getAmounts';
import { getTokensAfterRemove, removeLiquidity } from '../utils/removeLiquidity';
import { getAmountOfTokensRecievedFromSwap, swapTokens } from '../utils/swap';
import web3Modal from "web3modal";

export default function Home() {

  const [walletConnected,setWalletConnected] = useState(false);
  const [loading,setLoading] = useState(false);
  const [liquidityTab,setLiquidityTab] = useState(true);
  const zero = BigNumber.from(0);
  const [ethBalance,setEtherBalance] = useState(zero);
  const [reservedCM,setReservedCM] = useState(zero);
  const [etherBalanceContract,setEtherBalanceContract] = useState(zero);
  const [cmBalance,setCMBalance] = useState(zero);
  const [lpBalance,setLPBalance] = useState(zero);
  const [addEther, setAddEther] = useState(zero);
  const [addCMTokens,setAddCMTokens] = useState(zero);
  const [removeEther,setRemoveEther] = useState(zero);
  const [removeCM,setRemoveCM] = useState(zero);
  const [removeLPTokens, setRemoveLPTokens] = useState("0");
  const [swapAmount,setSwapAmount] = useState("")
  const [tokenToBeReceivedAfterSwap,settokenToBeReceivedAfterSwap] = useState(zero);
  const [ethSelected,setEthSelected] = useState(true);
  const web3ModalRef = useRef();


  const getAmounts = async() => {
    try{
      const provider = await getProviderOrSigner(false);
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const _ethBalance = await getEtherBalance(provider,address);
      const _cmBalance = await getCMTokensBalance(provider,address);
      const _lpBalance = await getLPTokenBalance(provider,address);
      const _reservedCM = await getReserveOfCMToken(provider);
      const _ethBalanceContract = await getEtherBalance(provider,null,true);
      setEtherBalance(_ethBalance);
      setCMBalance(_cmBalance);
      setLPBalance(_lpBalance);
      setReservedCM(_reservedCM);
      setEtherBalanceContract(_ethBalanceContract);
    }catch(err){
      console.error(err);
    }
  };

  const _removeLiquidity = async() => {
    try{
      const signer = await getProviderOrSigner(true);
      const removeLPTokenWei = utils.parseEther(removeLPTokens);
      setLoading(true);
      await removeLiquidity(signer,removeLPTokenWei);
      setLoading(false);
      await getAmounts();
      setRemoveCM(zero);
      setRemoveEther(zero);
    }catch(err){
      console.error(err);
      setLoading(false);
      setRemoveCM(zero);
      setRemoveEther(zero);
    }
  };

  const _addLiquidity = async() => {
    try{
      const addEtherWei = utils.parseEther(addEther.toString());
      if(!addCMTokens.eq(zero) && !addEtherWei.eq(zero)){
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        await addLiquidity(signer, addCMTokens,addEtherWei);
        setLoading(false);
        setAddCMTokens(zero);
        await getAmounts();
      }else{
        setAddCMTokens(zero);
      }
    }catch(err){
      console.error(err);
      setLoading(false);
      setAddCMTokens(zero);
    }
  };

  const _getAmountOfTokensReceievedFromSwap = async (_swapAmount) => {
    try{
      const _swapAmountWei = utils.parseEther(_swapAmount.toString());
      if(_swapAmountWei.eq(zero)){
        const provider = await getProviderOrSigner();
        const _ethBalance = await getEtherBalance(provider,null,true);
        const amountOfTokens = await getAmountOfTokensRecievedFromSwap(_swapAmountWei,provider,ethSelected,_ethBalance,reservedCM);
        settokenToBeReceivedAfterSwap(amountOfTokens);
      }else{
        settokenToBeReceivedAfterSwap(zero);
      }
    }catch(err){
      console.error(err);
    }
  };

  const _swapTokens = async () => {
    try{
      const swapAmountWei = utils.parseEther(swapAmount);
      if(!swapAmountWei.eq(zero)){
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        await swapTokens(signer,swapAmountWei,tokenToBeReceivedAfterSwap,ethSelected);
        setLoading(false);
        await getAmounts();
        setSwapAmount("");
      }
    }catch(err){
      console.error(err);
      setLoading(false);
      setSwapAmount("");
    }
  };


  const _getTokensAfterRemove = async (_removeLPTokens) => {
    try{
      const provider = await getProviderOrSigner();
      const removeLPTokenWei = utils.parseEther(_removeLPTokens);
      const _ethBalance = await getEtherBalance(provider,null,true);
      const cryptoMinionTokenReserve = await getReserveOfCMToken(provider);
      const {_removeEther,_removeCM} = await getTokensAfterRemove(provider,removeLPTokenWei,_ethBalance,cryptoMinionTokenReserve);
      setRemoveEther(_removeEther);
      setRemoveCM(_removeCM);
    }catch(err){
      console.error(err);
    }
  };

  const getProviderOrSigner = async(needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const {chainId} = await web3Provider.getNetwork();
    if(chainId!==5){
      window.alert("Change network to Goerli");
      throw new Error("change network to Goerli");
    }
    if(needSigner){
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const connectWallet = async() =>{
    try{
      await getProviderOrSigner();
      setWalletConnected(true);
    }catch(err){
      console.error(err);
    }
  };

  useEffect(() => {
    if(!walletConnected) {
      web3ModalRef.current = new web3Modal({
        network:"goerli",
        providerOptions:{},
        disableInjectedProvider: false,
      });
      connectWallet();
      getAmounts()
    }
  },[walletConnected]);

  const renderButton = () => {
    if(!walletConnected){
      return(
        <button onClick={connectWallet} className = {styles.button}>
          Connect your wallet
        </button>
      );
    }

    if(loading){
      return <button className={styles.button}>Loading...</button>;
    }

    if(liquidityTab){

      return(
        <div>
          <div className={styles.description}>
            You have:
            <br />
            {utils.formatEther(cmBalance)} Crypto Minion Tokens
            <br />
            {utils.formatEther(ethBalance)} Ether 
            <br />
            {utils.formatEther(lpBalance)} Crypto Minion LP Token 
          </div>
          <div>
            {utils.parseEther(reservedCM.toString()).eq(zero) ? (
              <div>
                <input
                  type = "number"
                  placeholder="Amount of Ether"
                  onChange = {(e) => setAddEther(e.target.value || "0")}
                  className = {styles.input}
                />
                <input 
                  type="number"
                  placeholder="Amount of CryptoMinion Tokens"
                  onChange={(e) => setAddCMTokens(
                    BigNumber.from(utils.parseEther(e.target.value || "0"))
                  )}
                  className = {styles.input}
                />
                <button className={styles.button1} onClick = {_addLiquidity}>
                  Add
                </button>
              </div>
            ): (
              <div>
                <input
                  type = "number"
                  placeholder="Amount of Ether"
                  onChange={ async(e) => {
                    setAddEther(e.target.value || "0");
                    const _addCMTokens = await calculateCM(e.target.value || "0",etherBalanceContract,reservedCM);
                    setAddCMTokens(_addCMTokens);
                  }}
                  className = {styles.input}
                />
                <div className = {styles.inputDiv}>
                  {`You will need ${utils.formatEther(addCMTokens)} Crypto Minion Tokens`}
                </div>
                <button className = {styles.button1} onClick = {_addLiquidity}>
                  Add
                </button>
              </div>
            )}
            <div>
              <input 
                type = "number"
                placeholder="Amount of LP Tokens"
                onChange={async(e) => {
                  setRemoveLPTokens(e.target.value || "0");
                  await _getTokensAfterRemove(e.target.value || "0");
                }}
                className = {styles.input}
              />
              <div className={styles.inputDiv}>
                {`You will get ${utils.formatEther(removeCM)} Crypto Minion Tokens amd ${utils.formatEther(removeEther)} Eth`}
              </div>
              <button className={styles.button1} onClick = {_removeLiquidity}>
                Remove
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return(
        <div>
          <input
            type="number"
            placeholder="Amount"
            onChange={async(e) => {
              setSwapAmount(e.target.value || "");
              await _getAmountOfTokensReceievedFromSwap(e.target.value || "0");
            }}
            className = {styles.input}
            value = {swapAmount}
          />
          <select 
            className = {styles.select}
            name = "dropdown"
            id = "dropdown"
            onChange={ async () => {
              setEthSelected(!setEthSelected);
              await _getAmountOfTokensReceievedFromSwap(0);
              setSwapAmount("");
            }}>
              <option value = "eth">Ethereum</option>
              <option value = "cryptoMinionToken">Crypto Minion Token</option>
          </select>
          <br />
          <div className={styles.inputDiv}>
            {ethSelected
            ? `You will get ${utils.formatEther(tokenToBeReceivedAfterSwap)} Crypto Minion Tokens`
          : `You will get ${utils.formatEther(tokenToBeReceivedAfterSwap)} Eth`}
          </div>
          <button className={styles.button1} onClick = {_swapTokens}>
            Swap
          </button>
        </div>
      );
    }
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>Crypto Minion Exchange</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div>
          <div className={styles.title}>
            <h2>Welcome to Crypto Minion Exchange!</h2>
          </div>
          <div className={styles.description}>Exchange Ethereum &#60;&#62; Crypto Minion Token</div>
          <div className={styles.flex}>
            <button className={styles.button} onClick = {() =>{setLiquidityTab(true)}}>Liquidity</button>
            <button className={styles.button} onClick = {() => {setLiquidityTab(false)}}>Swap</button>
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src ="./boss.png" />
        </div>
      </div>
      <footer className={styles.footer}>
      Made with &#10084; by Crypto Minions
      </footer>
    </div>
  );
}
