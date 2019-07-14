import React, {useEffect, useState} from 'react';
import { KeyringInstance } from '@polkadot/keyring/types';
import { ApiPromise } from '@polkadot/api';
import { Table } from 'semantic-ui-react';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

interface Props {
  api: ApiPromise,
  keyring: KeyringInstance,
  injected: InjectedAccountWithMeta[] | undefined
};

export default function Balances(props: Props) {
  const {api, injected, keyring} = props;
  const accounts = keyring.getPairs();
  const addresses = accounts.map(account => account.address);
  const accountNames: string[] = accounts.map((account) => account.meta.name)

  injected && injected.map((accountWithMeta) => {
    accountNames.push(accountWithMeta.meta.name + ' (extension)');
    addresses.push(accountWithMeta.address)
  });
  
  const [balances, setBalances] = useState<{[index: string]: string }>({});

  useEffect(() => {
    let unsubscribeAll : Function | undefined;

    api.query.balances.freeBalance
      .multi(addresses, (currentBalances) => {
        currentBalances.map((balance, index) => 
          setBalances(balances => {
            return {
              ...balances,
              [addresses[index]]: balance.toString()
            }
          })
        );
      })
      .then( unsub => unsubscribeAll = unsub)
      .catch(console.error);
      
    return () => unsubscribeAll && unsubscribeAll() ;
  },[]);
  
  return (
    <>
      <h1>Balances</h1>
      <Table celled striped> 
        <Table.Body>
          {accountNames.map((name,index) =>  {
            const address = addresses[index]
            return (
              <Table.Row key={index}>
                <Table.Cell textAlign='right'>{name}</Table.Cell>
                <Table.Cell>{address}</Table.Cell>
                <Table.Cell>{balances && balances[address]}</Table.Cell>  
              </Table.Row>  
            )
          })}
        </Table.Body>
      </Table>
    </>
  )
}