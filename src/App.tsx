import React, { useState, useEffect } from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';
import keyring from '@polkadot/ui-keyring'
import { Container} from 'semantic-ui-react';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import 'semantic-ui-css/semantic.min.css'

import Balances from './Balances'
import Transfer from './Transfer'

 export default function App () {
  const [api, setApi] = useState<ApiPromise>();
  const [loaded, setLoaded] = useState(false);

  useEffect (() => {
    const provider = new WsProvider();

    ApiPromise.create(provider)
    .then((api) => setApi(api))
    .catch((e)=> console.error(e));
  },[])

  useEffect(() => {
/*
    let injectedAccounts: {
          address: string;
          meta: {
              name: string;
              source: string;
          };
      }[] = [];
*/
    web3Enable('basic substrate ui')
    .then((extensions) => {
      extensions.map((extension) => console.log('extension',extension))

      // if the user accepts it the extension's array will contain something 
      if (extensions.length){
        web3Accounts().then((accounts) => {
          return accounts.map(({ address, meta }) => ({
            address,
            meta: {
              ...meta,
              name: `${meta.name} (extension)`
            }
          }))
        })
        .then((injectedAccounts) => {
          keyring.loadAll({
            isDevelopment: true
          },injectedAccounts);
          setLoaded(true);
        } 
          
        );
      } else {
        keyring.loadAll({
          isDevelopment: true
        })
        setLoaded(true);
      }
    })
  },[]);

  if(!api || !api.isReady || !loaded){
    return <div>Disconnected</div>
  }

  return (
    <Container>
      <Balances
        api={api}
        keyring={keyring}
      />
      <Transfer
        api={api}
        keyring={keyring}
      />
    </Container>
  );
}
