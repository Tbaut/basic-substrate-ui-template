import React, { useState, SyntheticEvent } from 'react';
import { ApiPromise } from '@polkadot/api';
import { Button, Dropdown, Form, Input, DropdownProps, InputOnChangeData } from 'semantic-ui-react';
import { Keyring } from '@polkadot/ui-keyring';
import { web3FromSource } from '@polkadot/extension-dapp';
import { KeyringPair } from '@polkadot/keyring/types';

interface Props {
  api: ApiPromise,
  keyring: Keyring
};

interface FormState {
  addressFrom: string,
  addressTo: string,
  amount: number
}

const initialState: FormState = {
  addressFrom: '',
  addressTo: '',
  amount: 0
};

export default function Transfer (props: Props) {
  const { api, keyring } = props;
  const [formState, setFormState] = useState<FormState>(initialState);
  const [status, setStatus] = useState<string>('');

  // get the list of accounts we possess the private key for
  const keyringOptions = keyring.getPairs().map((account) => ({
    key: account.address,
    value: account.address,
    text: account.meta.name.toUpperCase()
  }));

  const onChange = (_:SyntheticEvent<HTMLElement, Event>, data:InputOnChangeData | DropdownProps): void => {
    setFormState(formState => {
      return {
        ...formState,
        [data.state]: data.value
      };
    });
  };

  const makeTransfer = async () => {
    const { addressTo, addressFrom, amount } = formState;
    const fromPair = keyring.getPair(addressFrom);
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

      api.tx.balances
        .transfer(addressTo, amount)
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
  };

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
            value={formState.addressFrom}
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
            value={formState.addressTo}
          />
        </Form.Field>
        <Form.Field>
          <Input
            label='Amount'
            fluid
            onChange={onChange}
            state='amount'
            type='number'
            value={formState.amount}
          />
        </Form.Field>
        <Form.Field>
          <Button
            onClick={makeTransfer}
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
