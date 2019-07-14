import React, {useEffect, useState} from 'react';
import { KeyringInstance } from '@polkadot/keyring/types';
import { ApiPromise } from '@polkadot/api';
import { Table } from 'semantic-ui-react';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { InjectedExtension, InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

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

  const [injectedBalances, setInjectedBalances] = useState<{[index: string]: string}>({})

  useEffect(()=>{
    let allInjected: InjectedExtension[];
    let allInjectedAccounts: InjectedAccountWithMeta[];

    web3Enable('my cool dapp').then((extensions: InjectedExtension[]) => {
      extensions.map((extension) => {
        console.log('extension',extension);
      })

      if (extensions.length){
        web3Accounts().then((injectedAccounts) => {
          injectedAccounts.map((injectedAccount) => {
            console.log('injectedAccount',injectedAccount)
          })
        });
      }
    });
  },[]);

  return (
    <>
      <h1>Balances</h1>
      <Table celled striped> 
        <Table.Body>
          {accounts.map((account,index) =>  {
            return (
              <Table.Row key={index}>
                <Table.Cell textAlign='right'>{account.meta.name}</Table.Cell>
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