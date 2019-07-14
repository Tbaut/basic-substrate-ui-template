import React, { useState, useEffect } from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';
import testKeyring from '@polkadot/keyring/testing'
import { Container} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css'

import Balances from './Balances'
import Transfer from './Transfer'

 export default function App () {
  const [api, setApi] = useState<ApiPromise>();

  useEffect (()=>{
    const getApi = async () => {
      const provider = new WsProvider();
      try {
        // Create the API and wait until ready
        const api = await ApiPromise.create(provider);
        setApi(api);
      } catch (e) {
        console.error(e)
      }
    }

    getApi();
  })

  if(!api || !api.isReady){
    return <div>Disconnected</div>
  }

  return (
    <Container>
      <Balances
        api={api}
        keyring={testKeyring()}
      />
      <Transfer
        api={api}
        keyring={testKeyring()}
      />
    </Container>
  );
}
