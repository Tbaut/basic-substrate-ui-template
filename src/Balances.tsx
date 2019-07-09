import React, {useEffect, useState} from 'react';
import { KeyringInstance } from '@polkadot/keyring/types';
import { ApiPromise } from '@polkadot/api';

interface Props {
  api: ApiPromise,
  keyring: KeyringInstance
};

export default function Balances(props: Props) {
  const {api, keyring} = props;
  const accounts = keyring.getPairs();
  const account = accounts[0]
  const [balances, setBalances] = useState<{[index: string]: string }>({});

  useEffect(() => {
    let unsubscribe: Function | undefined;

    api.query.balances.freeBalance(account.address, (current) => {
      setBalances(balances => {
        return {
          ...balances,
          [account.address]: current.toString()
        }
      })  
    })
    .then( unsub => unsubscribe = unsub )
    .catch (console.error);

    return () => unsubscribe && unsubscribe();
  },[]);

  function renderAccountWithBalances () {
    return <p>{account.meta.name}: {account.address} balance: {balances && balances[account.address]}</p>;

  }

  return (
    <>
      <h1>Balances</h1>
      {renderAccountWithBalances()}
    </>
  )
}