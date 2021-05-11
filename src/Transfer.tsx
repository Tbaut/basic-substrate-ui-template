import React, { useState, SyntheticEvent, useCallback } from 'react';
import { ApiPromise } from '@polkadot/api';
import { Keyring } from '@polkadot/ui-keyring';
import { Dropdown, Form, Input, DropdownProps, InputOnChangeData, Button } from 'semantic-ui-react';

import { KeyringPair } from '@polkadot/keyring/types';
import { web3FromSource } from '@polkadot/extension-dapp';

interface Props {
  api: ApiPromise;
  keyring: Keyring;
}

interface FormState {
  addressFrom: string;
  addressTo: string;
  amount: number;
}

const initialState: FormState = {
  addressFrom: '',
  addressTo: '',
  amount: 0
};

export default function Transfer (props: Props): JSX.Element {
  const { api, keyring } = props;
  const [formState, setFormState] = useState<FormState>(initialState);
  const [status, setStatus] = useState<string>('');
  const { addressTo, addressFrom, amount } = formState;
  const fromPair = (addressFrom && keyring.getPair(addressFrom)) || undefined;
  // get the list of accounts we possess the private key for
  const keyringOptions = keyring.getPairs().map((account) => ({
    key: account.address,
    value: account.address,
    text: (account.meta.name as string).toUpperCase()
  }));

  const onChange = (_: SyntheticEvent<HTMLElement, Event>, data: InputOnChangeData | DropdownProps): void => {
    setFormState(formState => {
      return {
        ...formState,
        [data.state]: data.value
      };
    });
  };

  const makeCall = useCallback(async () => {
    if (fromPair) {
      const { address, meta: { source, isInjected } } = fromPair;
      let fromParam: string | KeyringPair;

      // set the signer
      if (isInjected) {
        const injected = await web3FromSource(source as string);
        fromParam = address;
        api.setSigner(injected.signer);
      } else {
        fromParam = fromPair;
      }

      try {
        setStatus('Sending...');
        api.tx.balances.transferKeepAlive(addressTo, amount)
        .signAndSend(fromParam, ({ status }) => {
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
  }, []);
  
  return (
    <>
      <h1>Transfer</h1>
      <Form>
        <Form.Field>
          <Dropdown
            placeholder='Select from  your accounts'
            fluid
            label="From"
            onChange={onChange}
            search
            selection
            state='addressFrom'
            options={keyringOptions}
            value={addressFrom}
          />
        </Form.Field>
        <Form.Field>
          <Input
            onChange={onChange}
            label='To'
            fluid
            placeholder='address'
            state='addressTo'
            type='text'
            value={addressTo}
          />
        </Form.Field>
        <Form.Field>
          <Input
            label='Amount'
            fluid
            onChange={onChange}
            state='amount'
            type='number'
            value={amount}
          />
        </Form.Field>
        <Form.Field>
        <Button
          onClick={makeCall}
          primary
          type='submit'
        >
          Send
        </Button>
          {status}
        </Form.Field>
      </Form>
    </>
  );
}
