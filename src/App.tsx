import React, { useState, useEffect } from 'react';
import { Container, Dimmer, Loader } from 'semantic-ui-react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import keyring from '@polkadot/ui-keyring';

import Balances from './Balances';
import NodeInfo from './NodeInfo';
import 'semantic-ui-css/semantic.min.css';
import Transfer from './Transfer';

type injectedAccountType = {
  address: string;
  meta: {
      name: string;
      source: string;
  };
}

export default function App (): JSX.Element {
  const [api, setApi] = useState<ApiPromise>(new ApiPromise());
  const [apiReady, setApiReady] = useState(false);
  const [accountLoaded, setaccountLoaded] = useState(false);
  // const WS_PROVIDER = 'ws://127.0.0.1:9944';
  const WS_PROVIDER = 'wss://dev-node.substrate.dev:9944';

  useEffect(() => {
    const provider = new WsProvider(WS_PROVIDER);

    ApiPromise.create({provider})
      .then((api) => {
        setApi(api);
      })
      .catch(console.error);
  }, []);
  
  useEffect(() => {
    api.isReady.then(() => setApiReady(true));
    }, [api.isReady]);

  const loadAccounts = (injectedAccounts: injectedAccountType[] = []): void => {
    keyring.loadAll({
      isDevelopment: true
    }, injectedAccounts);
    setaccountLoaded(true);
  };

  useEffect(() => {
    web3Enable('basic-dapp-tutorial')
      .then(() => {
        // web3Account resolves with the injected accounts
        // or an empty array
        web3Accounts()
          .then((accounts) => {
            return accounts.map(({ address, meta }) => ({
              address,
              meta: {
                ...meta,
                name: `${meta.name} (${meta.source})`
              }
            }));
          })
          .then((injectedAccounts) => {
            loadAccounts(injectedAccounts);
          })
          .catch(console.error);
      })
      .catch(console.error);
  }, []);


  const loader = function (text: string): JSX.Element {
    return (
      <Dimmer active>
        <Loader size='small'>{text}</Loader>
      </Dimmer>
    );
  };

  if (!apiReady) {
    return loader('Connecting to the blockchain');
  }

  if (!accountLoaded) {
    return loader('Loading accounts (please review any extension\'s authorization)');
  }

  return (
    <Container>
      <NodeInfo
        api={api}
      />
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
