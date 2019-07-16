import React, { useState, useEffect } from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';
import keyring from '@polkadot/ui-keyring'
import { Container, Dimmer, Loader} from 'semantic-ui-react';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import 'semantic-ui-css/semantic.min.css'

import Balances from './Balances'
import Transfer from './Transfer'

interface injectedAccounts {
  address: string;
  meta: {
      name: string;
      source: string;
  };
};

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
    web3Enable('basic substrate ui')
    .then((extensions) => {
      // if the user accepts it the extension's array will contain something 
      // extensions.map((extension) => console.log('extension',extension))
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
          loadAccounts(injectedAccounts)
        } 
          
        );
      } else {
        loadAccounts();
      }
    })

    const loadAccounts = function (injectedAccounts: injectedAccounts[] = []) {
      keyring.loadAll({
        isDevelopment: true
      }, injectedAccounts)
      setLoaded(true);
    }
  },[]);

  const loader = function (text:string){
    return (
      <Dimmer active>
        <Loader size='small'>{text}</Loader>
      </Dimmer>
    );
  };

  if (!loaded) {
    return loader('Please review the extension\'s authorization')
  }
  
  if(!api || !api.isReady){
    return loader('Connecting to the blockchain')
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
