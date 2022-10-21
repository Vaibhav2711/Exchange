//SPDX-License-Identifier:MIT

pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {

    address public cryptoMinionTokenAddress;

    constructor(address _cryptoMinionTokenAddress) ERC20("Crypto Minion LP Token","CMLP"){
        require(_cryptoMinionTokenAddress != address(0),"Adress is an null address");
        cryptoMinionTokenAddress = _cryptoMinionTokenAddress;
    }

    function getReserve() public view returns(uint) {
        return ERC20(cryptoMinionTokenAddress).balanceOf(address(this));
    }

    function addLiquidity(uint _amount) public payable returns(uint){
        uint liquidity;
        uint ethBalance = address(this).balance;
        uint cryptoMinionTokenReserve = getReserve();
        ERC20 cryptoMinionToken = ERC20(cryptoMinionTokenAddress);

        if(cryptoMinionTokenReserve == 0){
            cryptoMinionToken.transferFrom(msg.sender,address(this),_amount);
            liquidity = ethBalance;
            _mint(msg.sender,liquidity);
        }
        else{
            uint ethReserve = ethBalance-msg.value;
            uint cryptoMinionTokenAmount = (msg.value*cryptoMinionTokenReserve)/(ethReserve);
            require(_amount>=cryptoMinionTokenAmount,"Amount of token is less than the minimum tokens required");
            cryptoMinionToken.transferFrom(msg.sender,address(this),cryptoMinionTokenAmount);
            liquidity = (totalSupply()*msg.value)/ethReserve;
            _mint(msg.sender,liquidity);
        }
        return liquidity;
    }

    function removeLiquidity(uint _amount) public returns(uint,uint){
        require(_amount>0,"Amount should be greater than 0");
        uint _ethBalance = address(this).balance;
        uint _totalSupply = totalSupply();
        uint ethAmount = (_amount*_ethBalance)/_totalSupply;
        uint tokenAmount = (_amount*getReserve())/_totalSupply;
        _burn(msg.sender,_amount);
        payable(msg.sender).transfer(ethAmount);
        ERC20(cryptoMinionTokenAddress).transfer(msg.sender,tokenAmount);
        return(ethAmount,tokenAmount);
    }

    function amountOfToken(uint inputAmount,uint inputReserve, uint outputReserve ) public pure returns(uint256){
        require(inputReserve>0 && outputReserve > 0 ,"Invalid Reserve");
        uint256 inputAmountWithFee = (inputAmount*99)/100;
        uint256 numerator = inputAmountWithFee*outputReserve;
        uint256 denominator = inputReserve+inputAmountWithFee;
        return numerator/denominator;
    }

    function ethToCryptoMinionToken(uint minToken) public payable{
        uint256 tokenReserve = getReserve();
        uint256 ethReserve = address(this).balance - msg.value;
        uint256 tokenBought = amountOfToken(msg.value, ethReserve, tokenReserve);
        require(tokenBought >= minToken,"insufficient output amount");
        ERC20(cryptoMinionTokenAddress).transfer(msg.sender,tokenBought);
    }

    function cryptoMinionToEth(uint tokenSold, uint minEth) public {
        uint256 tokenReserve = getReserve();
        uint ethBought = amountOfToken(tokenSold, tokenReserve, address(this).balance);
        require(ethBought >= minEth,"insufficient output amount");
        ERC20(cryptoMinionTokenAddress).transferFrom(msg.sender,address(this),tokenSold);
        payable(msg.sender).transfer(ethBought);
    }
}