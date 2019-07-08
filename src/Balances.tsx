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
    const unsubscribes = accounts.map(async (account) => {
      try {
        await api.query.balances.freeBalance(account.address, (current) => {
          setBalances(balances => {
            return {
              ...balances,
              [account.address]: current.toString()
            }
          });
        })
      } catch (error) {
        console.error(error);
      }
    });
      
    // return () => unsubscribes.length && unsubscribes.map(async (unsubscribe) => {
    //   if (unsubscribe) await unsubscribe();
    // }) ;
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