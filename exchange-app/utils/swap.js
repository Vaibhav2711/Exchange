import { Contract } from "ethers";
import { EXCHANGE_CONTRACT_ABI, EXCHANGE_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_ADDRESS  } from "../constants";

export const getAmountOfTokensRecievedFromSwap = async(_swapAmountWei, provider, ethSelected, ethBalance, reservedCM) => {
    const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS,EXCHANGE_CONTRACT_ABI,provider);
    let amountOfTokens;
    if(ethSelected){
        console.log(ethBalance.toString());
        console.log(reservedCM.toString());
        amountOfTokens = await exchangeContract.amountOfToken(_swapAmountWei,ethBalance,reservedCM);
    }else{
        amountOfTokens = await exchangeContract.amountOfToken(_swapAmountWei,reservedCM,ethBalance);
    }
    return amountOfTokens;
}

export const swapTokens = async(signer,swapAmountWei,tokenToBeReceivedAfterSwap,ethSelected) => {
    const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS,EXCHANGE_CONTRACT_ABI,signer);
    const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS,TOKEN_CONTRACT_ABI,signer);
    let tx;
    if(ethSelected){
        tx = await exchangeContract.ethToCryptoMinionToken(tokenToBeReceivedAfterSwap,{value: swapAmountWei,});
    }else{
        tx = await exchangeContract.approve(EXCHANGE_CONTRACT_ADDRESS,swapAmountWei.toString());
        await tx.wait();
        tx = await exchangeContract.cryptoMinionToEth(swapAmountWei,tokenToBeReceivedAfterSwap);
    }
    await tx.wait();
};