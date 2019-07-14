import React, { useState, useEffect } from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';
import testKeyring from '@polkadot/keyring/testing'
import { Container} from 'semantic-ui-react';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import 'semantic-ui-css/semantic.min.css'

import Balances from './Balances'
import Transfer from './Transfer'

 export default function App () {
  const [api, setApi] = useState<ApiPromise>();

  useEffect (() => {
    const provider = new WsProvider();

    ApiPromise.create(provider)
    .then((api) => setApi(api))
    .catch((e)=> console.error(e));
  },[])

  const [injectedAccounts, setInjectedAccounts] = useState<InjectedAccountWithMeta[]>()

  useEffect(() => {
    web3Enable('basic substrate ui').then((extensions) => {
      // this sends the request for connection
      extensions.map((extension) => console.log('extension',extension))

      // if the user accepts it the extension's array will contain something 
      if (extensions.length){
        web3Accounts().then((injectedAccounts) => {
          setInjectedAccounts(injectedAccounts);
          injectedAccounts.map((injectedAccount) => console.log('injectedAccount',injectedAccount))
        });
      }
    });
  },[]);

  if(!api || !api.isReady){
    return <div>Disconnected</div>
  }

  return (
    <Container>
      <Balances
        api={api}
        keyring={testKeyring()}
        injected={injectedAccounts}
      />
      <Transfer
        api={api}
        keyring={testKeyring()}
        // injected={injectedAccounts}
      />
    </Container>
  );
}
