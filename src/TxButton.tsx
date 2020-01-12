import React from 'react';
import { Button } from 'semantic-ui-react';
import { web3FromSource } from '@polkadot/extension-dapp';
import { KeyringPair } from '@polkadot/keyring/types';
import { ApiPromise } from '@polkadot/api';

interface Props {
    api: ApiPromise;
    fromPair?: KeyringPair;
    label: string;
    params: any[];
    setStatus: (statusString: string) => void;
    tx: any;
}

export default function TxButton ({ api, fromPair, label, params, setStatus, tx }: Props) {
  const makeCall = async () => {
    if (fromPair) {
      const { address, meta: { source, isInjected } } = fromPair;
      let fromParam: string | KeyringPair;

      // set the signer
      if (isInjected) {
        const injected = await web3FromSource(source);
        fromParam = address;
        api.setSigner(injected.signer);
      } else {
        fromParam = fromPair;
      }

      try {
        setStatus('Sending...');
        tx(...params).signAndSend(fromParam, ({ status }: { status: any }) => {
          if (status.isFinalized) {
            setStatus(`Completed at block hash #${status.asFinalized.toString()}`);
          } else {
            setStatus(`Current transfer status: ${status.type}`);
          }
        });
      } catch (e) {
        setStatus(':( transaction failed');
        console.error('ERROR:', e);
      }
    }
  };

  return (
    <Button
      onClick={makeCall}
      primary
      type='submit'
    >
      {label}
    </Button>
  );
}
