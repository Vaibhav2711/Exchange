import { Contract, utils } from "ethers";
import { TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, EXCHANGE_CONTRACT_ADDRESS } from "../constants";

export const addLiquidity = async(signer, addCMAmountWei, addEtherAmountWei) => {
    try{
        console.log(addCMAmountWei.toString());
        console.log(addEtherAmountWei.toString());
        const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS,TOKEN_CONTRACT_ABI,signer);
        console.log("8");
        const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS,EXCHANGE_CONTRACT_ABI,signer);
        console.log("10");
        let tx = await tokenContract.approve(EXCHANGE_CONTRACT_ADDRESS,addCMAmountWei.toString());
        console.log("12");
        await tx.wait();
        console.log("14");
        tx = await exchangeContract.addLiquidity(addCMAmountWei,{value: addEtherAmountWei,});
        console.log("16");
        await tx.wait();
        console.log("18");
    }catch(err){
        console.error(err);
    }
};

export const calculateCM = async(_addEther = "0",etherBalanceContract,cmTokenReserve) => {
    const _addEtherAmountWei = utils.parseEther(_addEther);
    const cryptoMinionTokenAmount = _addEtherAmountWei.mul(cmTokenReserve).div(etherBalanceContract);
    return cryptoMinionTokenAmount;
};