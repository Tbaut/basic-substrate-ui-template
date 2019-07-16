import React, {useEffect, useState} from 'react';
import { ApiPromise } from '@polkadot/api';
import { Table } from 'semantic-ui-react';
import { Keyring } from '@polkadot/ui-keyring';

interface Props {
  api: ApiPromise,
  keyring: Keyring
};

export default function Balances(props: Props) {
  const {api, keyring} = props;
  const accounts = keyring.getPairs();
  const addresses = accounts.map(account => account.address);
  const accountNames: string[] = accounts.map((account) => account.meta.name)
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
          {addresses.map((address,index) =>  {
            return (
              <Table.Row key={index}>
                <Table.Cell textAlign='right'>{accountNames[index]}</Table.Cell>
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