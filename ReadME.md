# taproot-marketplace-backend

## ENV

Node: 18.18.2
Yarn: 1.22.21
Npm: 9.8.1

### API_URL

```
https://milo.metabest.tech/api
```
### API_LIST
```
POST
https://milo.metabest.tech/api/users/getUserInfo
erc20Account: string

POST
https://milo.metabest.tech/api/users/setUserInfo
erc20Account: string
name: string
avatar: number
background: number
actionDate: date
signData: object

POST
https://milo.metabest.tech/api/users/getUserInscriptions
btcAccount: string

POST
https://milo.metabest.tech/api/users/withdrawInscription
erc20Account: string
inscriptionID: string
receiver: string
signData: object

POST
https://milo.metabest.tech/api/users/listInscription
inscriptionID: string
name: string
category: number
btcSeller: string
tokenAddress: string
tokenAmount: number
description: string
lockTime: number
actionDate: date
signData: object

POST
https://milo.metabest.tech/api/users/unListInscription
inscriptionID: string
btcSeller: string
actionDate: date
signData: object

POST
https://milo.metabest.tech/api/offers/getList
categories: [Number]
tokenAddresses: [String]
btcSellers: [String]
btcBuyers: [String]
inscriptionIDs: [String]
inscriptionNumbers: [String]
states: [Number]
minPrice: Number
maxPrice: Number
sortBy: Number
active: boolean

GET
https://milo.metabest.tech/api/inscriptions/detail?inscriptionID=${inscriptionID}
inscriptionID: String

GET
https://milo.metabest.tech/api/inscriptions/withdrawDetail?orderNumber=${orderNumber}
orderNumber: Number

GET
https://milo.metabest.tech/api/offers/getMostTrendList

GET
https://milo.metabest.tech/api/utils/getGasPrice?chainID=Number
const CHAINID_ETH = 1
const CHAINID_BSC = 56
const CHAINID_GOERLI = 5

GET
https://milo.metabest.tech/api/users/getNotify?erc20Account=erc20Account

POST
https://milo.metabest.tech/api/users/removeNotify
erc20Account: erc20Account
removeAll: bool
type: Number
link: string
content: string
notifyDate: Date
```