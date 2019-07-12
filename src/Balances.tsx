import React, {useEffect, useState} from 'react';
import { KeyringInstance } from '@polkadot/keyring/types';
import { ApiPromise } from '@polkadot/api';
import { Table } from 'semantic-ui-react';

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
  
    api.query.balances.freeBalance
      .multi(addresses, (currentBalances) => {
        console.log('currentBalances',currentBalances)
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
          {accounts.map((account,index) =>  {
            return (
              <Table.Row key={index}>
                <Table.Cell collapsing>{account.meta.name}</Table.Cell>
                <Table.Cell>{account.address}</Table.Cell>
                <Table.Cell>{balances && balances[account.address]}</Table.Cell>  
              </Table.Row>  
            )
          })}
        </Table.Body>
      </Table>
    </>
  )
}