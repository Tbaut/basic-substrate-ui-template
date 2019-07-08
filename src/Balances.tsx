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
  const [balances, setBalances] = useState<{[index: string]: string }>({});

  useEffect(() => {
    let unsubscribeAll : Function | undefined;
    const addresses = accounts.map(account => account.address);
  
    try {
      api.query.balances.freeBalance
        .multi(addresses, (currentBalances) => {
          currentBalances.map((balance, index) => {
            setBalances(balances => {
              return {
                ...balances,
                [addresses[index]]: balance.toString()
              }
            });
          });
        })
        .then( unsub => unsubscribeAll =  unsub);
    } catch (error) {
      console.error(error);
    }
      
    return () => unsubscribeAll && unsubscribeAll ;
  },[]);

  function renderAccountsWithBalances () {
    return accounts.map((account, index) =>  {
      return <p key={index}>{account.meta.name}: {account.address} balance: {balances && balances[account.address]}</p>;
    });
  }

  return (
    <>
      <h1>Balances</h1>
      {renderAccountsWithBalances()}
    </>
  )
}