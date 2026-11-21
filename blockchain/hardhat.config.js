require("@nomicfoundation/hardhat-toolbox");require("dotenv").config({path:"../.env"});
const pk=process.env.PRIVATE_KEY_DEPLOYER;
module.exports={solidity:"0.8.24",networks:{amoy:{url:process.env.RPC_URL||"",chainId:80002,accounts:pk?[pk]:[]}}};
