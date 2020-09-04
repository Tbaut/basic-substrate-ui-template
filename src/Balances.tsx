import React, { useEffect, useState } from 'react';
import { ApiPromise } from '@polkadot/api';
import { AccountInfo } from '@polkadot/types/interfaces';
import { Table } from 'semantic-ui-react';
import { Keyring } from '@polkadot/ui-keyring';

type Props = {
  api: ApiPromise;
  keyring: Keyring;
}

export default function Balances (props: Props): JSX.Element {
  const { api, keyring } = props;
  const accounts = keyring.getPairs();
  const addresses = accounts.map(account => account.address);
  const accountNames: string[] = accounts.map((account) => account.meta.name as string);
  const [balances, setBalances] = useState<{[index: string]: string }>({});

  useEffect(() => {
    let unsubscribeAll: () => void | undefined;

    api.query.system.account
      .multi(addresses, (currentBalances: AccountInfo[]) => {
        const balancesMap = addresses.reduce((acc, address, index) => ({
          ...acc,
          [address]: currentBalances[index].data.free.toString()
        }), {});
        setBalances(balancesMap);
      })
      .then(unsub => { unsubscribeAll = unsub; })
      .catch(console.error);

    return () => unsubscribeAll && unsubscribeAll();
  }, [api, addresses]);

  return (
    <>
      <h1>Balances</h1>
      <Table celled striped>
        <Table.Body>
          {addresses.map((address, index) => {
            return (
              <Table.Row key={index}>
                <Table.Cell textAlign='right'>{accountNames[index]}</Table.Cell>
                <Table.Cell>{address}</Table.Cell>
                <Table.Cell>{balances && balances[address]}</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </>
  );
}
